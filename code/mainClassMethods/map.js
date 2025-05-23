// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Leaflet from "leaflet";
import leaflet_mrkcls from "leaflet.markercluster";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import user__marker from "../assets/user.svg";
import { getLatLongFromStationDetail } from "../utils";
import { getPin } from "./utils";
import {
  requestCarsharingStations,
  requestCarsharingCarsOfStation,
  requestCarBrandsOfStations
} from "../api/carsharingStations";

export async function initializeMap() {
  const DefaultIcon = Leaflet.icon({
    iconUrl: icon,
    iconAnchor: [12.5, 41],
    shadowUrl: iconShadow,
  });
  Leaflet.Marker.prototype.options.icon = DefaultIcon;

  this.map = Leaflet.map(this.shadowRoot.getElementById("map"), {
    zoomControl: false,
  });

  Leaflet.tileLayer(this.tiles_url, {
    attribution: this.mapAttribution,
  }).addTo(this.map);

  this.map.setView(
    { lat: this.currentLocation.lat, lon: this.currentLocation.lng },
    parseInt(this.zoom)
  );
}

export function drawUserOnMap() {
  /**
   * User Icon
   */
  const user_icon = Leaflet.icon({
    iconUrl: user__marker,
    iconSize: [25, 25],
  });
  const user = Leaflet.marker(
    [this.currentLocation.lat, this.currentLocation.lng],
    {
      icon: user_icon,
    }
  );
  /**
   * Circle around the user
   */
  const circle = Leaflet.circle(
    [this.currentLocation.lat, this.currentLocation.lng],
    {
      radius: this.filters.radius * 1000,
      color: "rgba(66, 133, 244, 0.6)",
      fillColor: "rgba(66, 133, 244, 0.5)",
      weight: 1,
    }
  );
  /**
   * Add to map
   */
  this.layer_user = Leaflet.layerGroup([user, circle], {});
  this.layer_user.addTo(this.map);
}

export async function drawStationsOnMap() {
  const stations_layer_array = [];

  const carsharingStations = await requestCarsharingStations();

  const brandsOfStations = await requestCarBrandsOfStations();
  const brandsByStations = {};
  for (let b of brandsOfStations.data) {
    if (!(b.pcode in brandsByStations)) {
      brandsByStations[b.pcode] = []
    }
    brandsByStations[b.pcode].push(b["smetadata.brand"])
  }



  if (carsharingStations) {
    Object.values(carsharingStations.data)
      .filter((station) => {
        // Use filters on all retrieved stations
        let valid = true;
        if (this.filters.availability) {
          if (
            station.mvalue === 0
          ) {
            valid = false;
          }
        }

        if (valid) {
          valid = false;
          // add null check for brandsByStations[station.scode]
          const stationBrands = brandsByStations[station.scode] || []
          for (let brand of stationBrands) {
            if (this.filters[brand] === true) {
              valid = true;
              break;
            }
          }
        }

        return valid;
      })
      .map((station) => {
        const marker_position = getLatLongFromStationDetail(
          station.scoordinate
        );

        const actuallyAvailableVehicles = station.mvalue
        const availableVehicles = station.smetadata.availableVehicles

        const marker = Leaflet.marker(
          [marker_position.lat, marker_position.lng],
          {
            icon: getPin(actuallyAvailableVehicles, availableVehicles),
          }
        );

        const action = async () => {
          this.searchPlacesFound = {};

          const carsOfStation = await requestCarsharingCarsOfStation({
            scode: station.scode,
          });

          this.currentStation = {
            ...station,
            cars: carsOfStation.data
          };

          this.filtersOpen = false;
          this.detailsOpen = true;

        };

        marker.on("mousedown", action);
        stations_layer_array.push(marker);
      });
  }

  // remove markers before adding new ones
  this.map.eachLayer(function (layer) {
    if (layer instanceof L.MarkerClusterGroup) {
      layer.clearLayers();
    }
  });

  const stations_layer = Leaflet.layerGroup(stations_layer_array, {});


  this.layer_stations = new Leaflet.MarkerClusterGroup({
    showCoverageOnHover: false,
    chunkedLoading: true,
    iconCreateFunction(cluster) {
      return Leaflet.divIcon({
        html: `<div class="marker_cluster__marker">${cluster.getChildCount()}</div>`,
        iconSize: Leaflet.point(30, 30),
        color: "#8faf30"
      });
    },
  });
  /** Add maker layer in the cluster group */
  this.layer_stations.addLayer(stations_layer);
  /** Add the cluster group to the map */
  this.map.addLayer(this.layer_stations);
}
