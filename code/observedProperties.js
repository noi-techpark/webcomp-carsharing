// SPDX-FileCopyrightText: 2021 NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const observedProperties = {
  height: { type: String },
  width: { type: String },
  fontFamily: { type: String },
  language: { type: String },
  tiles_url: { type: String, attribute: "tiles-url" },
  currentLocation: { type: Object },
  zoom: { type: String },

  isLoading: { type: Boolean },
  filters: { type: Object },
  defaultFilters: { type: Object },


  hereMapsQuery: { type: String },
  searchPlacesFound: { type: Array },
  mapAttribution: { type: String },

  currentStation: { type: Object },

  detailsOpen: { type: Boolean },
  filtersOpen: { type: Boolean },

  isMobile: { type: Boolean },
  mobileOpen: { type: Boolean },
};
