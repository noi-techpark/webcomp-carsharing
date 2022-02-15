import { LitElement } from "lit-element";
import { isMobile, LANGUAGES } from "./utils";

export class BaseCarsharing extends LitElement {
  constructor() {
    super();
    this.height = "500px";
    this.width = "100%";
    this.fontFamily = "";
    this.mapAttribution = "";
    this.language = LANGUAGES.EN;
    this.disableDirections = false;

    this.isLoading = true;
    this.mobileOpen = false;
    this.isMobile = isMobile();

    this.map = undefined;
    this.currentLocation = { lat: 46.479, lng: 11.331 };
    this.zoom = 10;

    this.searchPlacesFound = {};
    this.hereMapsQuery = "";

    this.currentStation = {};
    this.data = {};
    this.detailsOpen = false;
    this.filtersOpen = false;

    this.filters = {
      radius: 0,
      availability: false,
      brandNames: {}
    };

    this.firstLoad = true;
  }
}
