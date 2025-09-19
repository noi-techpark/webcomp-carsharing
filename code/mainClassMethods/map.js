// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Leaflet from "leaflet";
import leaflet_mrkcls from "leaflet.markercluster";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import user__marker from "../assets/user.svg";
import { getPin } from "./utils";
import { carsharingDataService } from "../services/dataService";

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

  // Get filtered stations from data service
  const filteredStations = await carsharingDataService.getFilteredStations(this.filters);

  filteredStations.forEach((station) => {
    const marker = Leaflet.marker(
      [station.coordinates.lat, station.coordinates.lng],
      {
        icon: getPin(station.availableVehicles, station.maxVehicles),
      }
    );

    const action = async () => {
      this.searchPlacesFound = {};

      // Get detailed station data from service
      const stationDetails = await carsharingDataService.getStationDetails(station.id);
      
      if (stationDetails) {
        this.currentStation = stationDetails;
        this.filtersOpen = false;
        this.detailsOpen = true;
      }
    };

    marker.on("mousedown", action);
    stations_layer_array.push(marker);
  });

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
