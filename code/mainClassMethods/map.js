import Leaflet from "leaflet";
import leaflet_mrkcls from "leaflet.markercluster";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import user__marker from "../assets/user.svg";
import {
  getFormattedCarsharingData
} from "../api/carsharingStations";
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

  let data = await getFormattedCarsharingData();


  if (data.stations) {
    Object.values(data.stations)
      .filter((station) => {
        // Use filters on all retrived stations
        let valid = true;
        if (this.filters.availability) {
          if (
            station.sdatatypes["availability"] == 0
          ) {
            valid = false;
          }
        }
        return valid;
      })
      .map((station) => {
        const marker_position = getLatLongFromStationDetail(
          station.pcoordinate
        );

        const actuallyAvailableVehicles = station.availability
        const availableVehicles = station.pmetadata.availableVehicles

        const marker = Leaflet.marker(
          [marker_position.lat, marker_position.lng],
          {
            icon: getPin(actuallyAvailableVehicles, availableVehicles),
          }
        );

        const action = async () => {
          this.searchPlacesFound = {};

          this.currentStation = {
            ...station
          };

          this.filtersOpen = false;
          this.detailsOpen = true;

        };

        marker.on("mousedown", action);
        stations_layer_array.push(marker);
      });
  }

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
