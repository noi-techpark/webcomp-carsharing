// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { 
  requestCarsharingStations, 
  requestCarsharingCarsOfStation,
  requestCarsharingCar,
  requestCarsharingCars,
  requestStationCarRelations
} from "../api/carsharingStations";
import { 
  requestTourismCarsharingStations,
  requestMobilityCarsharingStations,
  requestTourismPois,
  requestHereMapsPlaces
} from "../api/poi";
import { BASE_PATH_MOBILITY, TOURISM_PATH_MOBILITY, ORIGIN } from "../api/config";
import { t } from "../translations";

/**
 * Centralized Data Service for Carsharing Web Component
 * 
 * This service handles all data fetching, normalization, and processing.
 * Components should only consume the normalized data from this service.
 */
export class CarsharingDataService {
  constructor() {
    this.stationsCache = null;
    this.brandsCache = null;
    this.brandsByStationsCache = null;
    this.bulkDataCache = null; // Cache for optimized bulk data
  }

  /**
   * Fetch all bulk data This is used for initial page load
   */
  async getBulkData() {
    if (this.bulkDataCache) {
      return this.bulkDataCache;
    }

    try {
      // Fetch all data in parallel
      const [stationCarRelations, allCars, allStations] = await Promise.all([
        requestStationCarRelations(),
        requestCarsharingCars(),
        requestCarsharingStations()
      ]);

      const carsByCode = {};
      const stationsByCode = {};
      const carToStationMap = {};
      const stationToCarMap = {};

      // Process cars
      if (allCars && allCars.data) {
        for (let car of allCars.data) {
          carsByCode[car.scode] = car;
        }
      }

      // Process stations
      if (allStations && allStations.data) {
        for (let station of Object.values(allStations.data)) {
          stationsByCode[station.scode] = station;
        }
      }

      // Process car-station relations
      if (stationCarRelations && stationCarRelations.data) {
        for (let relation of stationCarRelations.data) {
          const carCode = relation.scode;
          const stationCode = relation.mvalue;
          
          // Only include relations where station code is not "0" (car is at a station)
          if (stationCode !== "0") {
            carToStationMap[carCode] = stationCode;
            
            if (!stationToCarMap[stationCode]) {
              stationToCarMap[stationCode] = [];
            }
            stationToCarMap[stationCode].push(carCode);
          }
        }
      }

      this.bulkDataCache = {
        carsByCode,
        stationsByCode,
        carToStationMap,
        stationToCarMap
      };

      return this.bulkDataCache;
    } catch (error) {
      console.error("Error fetching bulk data:", error);
      return {
        carsByCode: {},
        stationsByCode: {},
        carToStationMap: {},
        stationToCarMap: {}
      };
    }
  }


  /**
   * Get all available car brands for filters
   * Returns normalized brand names with their filter states
   * Uses bulk data instead
   */
  async getCarBrands() {
    if (this.brandsCache) {
      return this.brandsCache;
    }

    try {
      const { carsByCode } = await this.getBulkData();
      const brands = {};

      // Process all cars from bulk data
      for (let car of Object.values(carsByCode)) {
        const brandName = car.smetadata?.vehicle_model?.model_name;
        if (brandName) {
          brands[brandName] = true;
        }
      }

      this.brandsCache = brands;
      return brands;
    } catch (error) {
      console.error("Error fetching car brands:", error);
      return {};
    }
  }

  /**
   * Get brands organized by station codes
   * Used for filtering stations by available car brands
   * Uses bulk data instead of hundreds of individual API calls
   */
  async getBrandsByStations() {
    if (this.brandsByStationsCache) {
      return this.brandsByStationsCache;
    }

    try {
      const { carsByCode, stationToCarMap } = await this.getBulkData();
      const brandsByStations = {};

      // Process each station and its cars
      for (let stationCode in stationToCarMap) {
        const carCodes = stationToCarMap[stationCode];
        const carBrands = [];

        for (let carCode of carCodes) {
          const car = carsByCode[carCode];
          if (car && car.smetadata?.vehicle_model?.model_name) {
            const brandName = car.smetadata.vehicle_model.model_name;
            if (!carBrands.includes(brandName)) {
              carBrands.push(brandName);
            }
          }
        }

        if (carBrands.length > 0) {
          brandsByStations[stationCode] = carBrands;
        }
      }

      this.brandsByStationsCache = brandsByStations;
      return brandsByStations;
    } catch (error) {
      console.error("Error fetching brands by stations:", error);
      return {};
    }
  }

  /**
   * Normalize station data to a consistent format
   */
  normalizeStationData(station) {
    return {
      id: station.scode,
      name: station.sname,
      coordinates: {
        lat: station.scoordinate.y,
        lng: station.scoordinate.x
      },
      availableVehicles: station.mvalue || 0,
      maxVehicles: station.smetadata.capacity_max || 1,
      lastUpdated: station.mvalidtime,
      metadata: station.smetadata,
    };
  }

  /**
   * Apply filters to stations
   */
  applyStationFilters(stations, filters, brandsByStations) {
    return stations.filter(station => {
      // Availability filter
      if (filters.availability && station.availableVehicles === 0) {
        return false;
      }

      // Brand filters
      const stationBrands = brandsByStations[station.id] || [];
      if (stationBrands.length === 0) {
        // If no brands found for this station, still show it
        return true;
      }

      // Check if any station brand matches enabled filters
      for (let brand of stationBrands) {
        if (filters[brand] === true) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Get filtered and normalized stations
   */
  async getFilteredStations(filters) {
    try {
      const [stationsResponse, brandsByStations] = await Promise.all([
        requestCarsharingStations(),
        this.getBrandsByStations()
      ]);

      if (!stationsResponse || !stationsResponse.data) {
        return [];
      }

      // Normalize all stations
      const normalizedStations = Object.values(stationsResponse.data)
        .map(station => this.normalizeStationData(station));

      // Apply filters
      const filteredStations = this.applyStationFilters(
        normalizedStations, 
        filters, 
        brandsByStations
      );

      return filteredStations;
    } catch (error) {
      console.error("Error fetching filtered stations:", error);
      return [];
    }
  }

  /**
   * Normalize car data to consistent format
   */
  normalizeCarData(car) {
    const brandName = car.smetadata?.vehicle_model?.model_name || 'Unknown';
    return {
      brand: brandName,
      isAvailable: car.mvalue === 0,
      lastUpdated: car.mvalidtime,
    };
  }

  /**
   * Get detailed station information including cars
   */
  async getStationDetails(stationCode) {
    try {
      const [stationsResponse, carsScodes] = await Promise.all([
        requestCarsharingStations(),
        requestCarsharingCarsOfStation({ scode: stationCode }),
      ]);

      if (!stationsResponse || !stationsResponse.data) {
        return null;
      }

      const station = Object.values(stationsResponse.data)
        .find(s => s.scode === stationCode);

      if (!station) {
        return null;
      }

      // Get cars details via requestCarsharingCar for each car code
      const carDetailsPromises = (carsScodes.data || []).map(car => 
        requestCarsharingCar({ scode: car.scode })
      );
      
      const carDetailsResponses = await Promise.all(carDetailsPromises);
      
      // Extract car data from each response and normalize
      const cars = [];
      for (let response of carDetailsResponses) {
        if (response && response.data && response.data.length > 0) {
          // Each response.data is an array, usually with one car
          for (let carData of response.data) {
            const normalizedCar = this.normalizeCarData(carData);
            cars.push(normalizedCar);
          }
        }
      }

      // Use station's availability data (how many spots are free)
      const stationAvailable = station.mvalue || 0;
      
      // Use station's max capacity from metadata (never use car count)
      const stationMaxCapacity = station.smetadata?.capacity_max || 
                                station.smetadata?.capacity || 
                                station.smetadata?.max_capacity || 1;

      // Filter to only cars that are actually available (at the station)
      const availableCars = cars.filter(car => car.isAvailable);

      // Group cars by brand with availability counts (only for available cars)
      const carsByBrands = {};
      for (let car of availableCars) { // Only process available cars
        const brand = car.brand;
        if (brand && brand !== 'Unknown') {
          if (!carsByBrands[brand]) {
            carsByBrands[brand] = {
              available: 0,
              total: 0 // This will be the count of available cars of this brand
            };
          }
          carsByBrands[brand].total += 1; // Count of this brand currently available
          carsByBrands[brand].available += 1; // Same as total since we only process available cars
        }
      }

      // Create normalized station with corrected totals
      const normalizedStation = {
        id: station.scode,
        name: station.sname,
        coordinates: {
          lat: station.scoordinate.y,
          lng: station.scoordinate.x
        },
        availableVehicles: stationAvailable, // Use station's availability data
        maxVehicles: stationMaxCapacity, // Use station's max capacity from metadata
        lastUpdated: station.mvalidtime,
        metadata: station.smetadata,
      };

      return {
        ...normalizedStation,
        cars: cars,
        carsByBrands: carsByBrands
      };
    } catch (error) {
      console.error("Error fetching station details:", error);
      return null;
    }
  }

  /**
   * Normalize search result data
   */
  normalizeSearchResults(items, language, source) {
    return items.map(item => {
      if (source === 'tourism-carsharing') {
        return {
          position: [item.GpsInfo[0].Latitude, item.GpsInfo[0].Longitude],
          title: item.Detail[language].Title || item.Shortname || "---",
          source: source
        };
      } else if (source === 'mobility-carsharing') {
        return {
          position: [item.scoordinate.y, item.scoordinate.x],
          title: item.smetadata[`name_${language}`] || item.sname || "---",
          source: source
        };
      } else if (source === 'here') {
        return {
          position: item.position,
          title: item.title,
          source: source
        };
      } else if (source === 'tourism') {
        return {
          position: [item.GpsInfo[0].Latitude, item.GpsInfo[0].Longitude],
          title: item.Detail[language].Title,
          source: source
        };
      }
      return null;
    }).filter(item => item !== null);
  }

  /**
   * Search for places with normalized results
   */
  async searchPlaces(query, language) {
    if (!query) {
      return {};
    }

    try {
      const results = {
        "Open Data Hub": [],
        "Other results": []
      };

      // Use API functions from poi.js for all requests
      const [tourismCarsharingData, mobilityCarsharingData, tourismData] = await Promise.all([
        requestTourismCarsharingStations(query),
        requestMobilityCarsharingStations(query),
        requestTourismPois(query)
      ]);

      // Process tourism carsharing results
      if (tourismCarsharingData && tourismCarsharingData.Items) {
        const normalized = this.normalizeSearchResults(tourismCarsharingData.Items, language, 'tourism-carsharing');
        results["Open Data Hub"].push(...normalized);
      }

      // Process mobility carsharing results
      if (mobilityCarsharingData && 
          mobilityCarsharingData.data && 
          mobilityCarsharingData.data.CarsharingStation && 
          mobilityCarsharingData.data.CarsharingStation.stations) {
        const stations = Object.values(mobilityCarsharingData.data.CarsharingStation.stations);
        const normalized = this.normalizeSearchResults(stations, language, 'mobility-carsharing');
        results["Open Data Hub"].push(...normalized);
      }

      // Process tourism general results
      if (tourismData && tourismData.Items) {
        const normalized = this.normalizeSearchResults(tourismData.Items, language, 'tourism');
        results["Other results"].push(...normalized);
      }

      // Try HERE Maps if no results found and API key available
      if (results["Open Data Hub"].length === 0 && 
          results["Other results"].length === 0 && 
          process.env.DOTENV && process.env.DOTENV.HEREMAPS_API_KEY) {
        
        const hereData = await requestHereMapsPlaces(query, process.env.DOTENV.HEREMAPS_API_KEY);
        if (hereData && hereData.results && hereData.results.items) {
          const normalized = this.normalizeSearchResults(hereData.results.items, language, 'here');
          results["Other results"].push(...normalized);
        }
      }

      return results;
    } catch (error) {
      console.error("Error searching places:", error);
      return {};
    }
  }

  /**
   * Clear all caches - useful when data needs to be refreshed
   */
  clearCache() {
    this.stationsCache = null;
    this.brandsCache = null;
    this.brandsByStationsCache = null;
    this.bulkDataCache = null; // Clear bulk data cache too
  }
}

// Export singleton instance
export const carsharingDataService = new CarsharingDataService();