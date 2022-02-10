export const observedProperties = {
  height: { type: String },
  width: { type: String },
  fontFamily: { type: String },
  language: { type: String },
  tiles_url: { type: String, attribute: "tiles-url" },
  currentLocation: { type: Object },
  zoom: { type: String },
  disableParkingForecast: { type: Boolean },
  disableParkingDirections: { type: Boolean },

  isLoading: { type: Boolean },
  filters: { type: Object },

  hereMapsQuery: { type: String },
  searchPlacesFound: { type: Array },
  mapAttribution: { type: String },

  currentStation: { type: Object },

  detailsOpen: { type: Boolean },
  filtersOpen: { type: Boolean },

  isMobile: { type: Boolean },
  mobileOpen: { type: Boolean },
};
