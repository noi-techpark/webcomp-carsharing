import Leaflet from "leaflet";
import leaflet_mrkcls from "leaflet.markercluster";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import user__marker from "../assets/user.svg";
import {
  requestMobilityParking,
  requestMobilityParkingDetails,
  requestTourismParking,
} from "../api/parkingStations";
import { getLatLongFromStationDetail } from "../utils";
import { getPin } from "./utils";

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

  const parkingStations = await requestMobilityParking();
  const tourismParkingStations = await requestTourismParking({
        language: this.language,
      });

  if (parkingStations) {
    Object.values(parkingStations.data.ParkingStation.stations)
      .filter((station) => {
        // Use filters on all retrived stations
        let valid = true;
        if (this.filters.availability) {
          if (
            station.sdatatypes.occupied &&
            station.sdatatypes.occupied.tmeasurements[0].mvalue >=
              station.smetadata.capacity
          ) {
            valid = false;
          }
        }
        return valid;
      })
      .map((station) => {
        const marker_position = getLatLongFromStationDetail(
          station.scoordinate
        );

        const realtimeFreePlaces = station.sdatatypes.free.tmeasurements[0].mvalue

        const marker = Leaflet.marker(
          [marker_position.lat, marker_position.lng],
          {
            icon: getPin(realtimeFreePlaces),
          }
        );

        const action = async () => {
          this.searchPlacesFound = {};
          const details = await requestMobilityParkingDetails({
            scode: station.scode,
          });
          if (details) {
            this.currentStation = {
              ...details.data.ParkingStation.stations[station.scode],
              lastChange: station.sdatatypes.free.tmeasurements[0].mvalidtime,
            };
          }

          this.filtersOpen = false;
          this.detailsOpen = true;
        };

        marker.on("mousedown", action);
        stations_layer_array.push(marker);
      });
  }

  if (tourismParkingStations) {
    tourismParkingStations.Items.map((station) => {
      const marker_position = getLatLongFromStationDetail({
        x: station.GpsPoints.position.Longitude,
        y: station.GpsPoints.position.Latitude,
      });
      const marker = Leaflet.marker(
        [marker_position.lat, marker_position.lng],
        {
          icon: getPin(-1),
        }
      );

      const action = async () => {
        if (station) {
          this.searchPlacesFound = {};
          this.currentStation = {
            scoordinate: marker_position,
            sname: station.Detail[this.language].Title,
            smetadata: {
              mainaddress: `${station.ContactInfos[this.language].City} ${
                station.ContactInfos[this.language].Address
              }`,
              municipality: "",
            },
            sdatatypes: undefined,
            lastChange: station.LastChange,
          };
        }

        this.filtersOpen = false;
        this.detailsOpen = true;
      };

      marker.on("mousedown", action);
      stations_layer_array.push(marker);
    });
  }

  const stations_layer = Leaflet.layerGroup(stations_layer_array, {});

  this.layer_stations = new leaflet_mrkcls.MarkerClusterGroup({
    showCoverageOnHover: false,
    chunkedLoading: true,
    iconCreateFunction(cluster) {
      return Leaflet.divIcon({
        html: `<div class="marker_cluster__marker">${cluster.getChildCount()}</div>`,
        iconSize: Leaflet.point(30, 30),
      });
    },
  });
  /** Add maker layer in the cluster group */
  this.layer_stations.addLayer(stations_layer);
  /** Add the cluster group to the map */
  this.map.addLayer(this.layer_stations);
}
