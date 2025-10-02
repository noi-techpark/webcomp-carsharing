// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import "@babel/polyfill";
import leafletStyle from "leaflet/dist/leaflet.css";
import { css, html, unsafeCSS } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { debounce as _debounce } from "lodash";
import { BaseCarsharing } from "./baseClass";
import { render_details } from "./components/details";
import { render_filters } from "./components/filters";
import { render__mapControls } from "./components/mapControls";
import { render_searchPlaces } from "./components/searchPlaces";
import { carsharingDataService } from "./services/dataService";
import {
  drawStationsOnMap,
  drawUserOnMap,
  initializeMap,
} from "./mainClassMethods/map";
import { observedProperties } from "./observedProperties";
import "./shared_components/button/button";
import "./shared_components/detailButton/detailButton";
import "./shared_components/checkBox/checkBox";
import "./shared_components/divider/divider";
import "./shared_components/dropdown/dropdown";
import "./shared_components/languagePicker/languagePicker";
// Shared components
import "./shared_components/searchBar/searchBar";
import "./shared_components/sideModalHeader/sideModalHeader";
import "./shared_components/sideModalRow/sideModalRow";
import "./shared_components/sideModalTabs/sideModalTabs";
import "./shared_components/radialProgress/radialProgress";
import "./shared_components/tag/tag";
import { t } from "./translations";
import { isMobile, LANGUAGES } from "./utils";
import CarsharingStyle from "./odh-carsharing.scss";

class Carsharing extends BaseCarsharing {
  static get properties() {
    return observedProperties;
  }

  static get styles() {
    return css`
      /* Map */
      ${unsafeCSS(leafletStyle)}
      ${unsafeCSS(CarsharingStyle)}
    `;
  }

  handleWindowResize() {
    if (isMobile() !== this.isMobile) {
      if (!this.isMobile) {
        this.mobileOpen = false;
      }
      this.isMobile = isMobile();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener(
      "resize",
      _debounce(this.handleWindowResize.bind(this), 150)
    );
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this.handleWindowResize.bind(this));
    super.disconnectedCallback();
  }


  async drawMap() {
    drawUserOnMap.bind(this)();
  }

  async firstUpdated() {
    initializeMap.bind(this)();
    drawUserOnMap.bind(this)();

    // Load car brands from data service and set up filters
    const brandFilters = await carsharingDataService.getCarBrands();
    this.filters = { ...this.filters, ...brandFilters };
    this.defaultFilters = { ...this.filters };

    await drawStationsOnMap.bind(this)();

    this.isLoading = false;
    this.firstLoad = false;
  }

  handleChangeTab(id) {
    this.currentTab = id;
  }


  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "mobileOpen" || propName === "isMobile") {
        this.map.invalidateSize();
      }
      if (
        (propName === "filters" || propName === "language") &&
        !this.firstLoad
      ) {
        drawStationsOnMap.bind(this)();
      }
    });
  }

  handleSearchBarFilterAction = () => {
    this.detailsOpen = false;
    this.filtersOpen = !this.filtersOpen;
  };

  searchPlaces = async (query) => {
    try {
      this.searchPlacesFound = await carsharingDataService.searchPlaces(query, this.language);
    } catch (error) {
      console.error("Error searching places:", error);
      this.searchPlacesFound = {};
    }
  };

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  render() {
    if (!this.tiles_url) {
      return html`
        <p style="color:red">Required attribute \`tiles_url\` is missing</p>
      `;
    }

    let isSmallWidth = false;
    let isSmallHeight = false;
    if (this.width.includes("px")) {
      isSmallWidth = parseInt(this.width.replace("px")) <= 400;
    } else if (this.width.includes("%")) {
      if (this.shadowRoot.querySelector(".carsharing")) {
        isSmallWidth =
          this.shadowRoot.querySelector(".carsharing").clientWidth <= 400;
      }
    }

    let height = `${this.height}`;

    if (this.height.includes("px")) {
      isSmallHeight = parseInt(this.height.replace("px")) <= 400;
    } else if (this.height.includes("%")) {
      if (this.shadowRoot.querySelector(".carsharing")) {
        height = `${this.shadowRoot.querySelector(".carsharing").clientHeight}px`;
        isSmallHeight =
          this.shadowRoot.querySelector(".carsharing").clientHeight <= 400;
      }
    }

    return html`
      <style>
        * {
          --width: ${this.width};
          --height: ${height};
          --w-c-font-family: ${this.fontFamily};
        }
      </style>

      <div
        class=${classMap({
          carsharing: true,
          mobile: this.isMobile,
          MODE__mobile__open: this.isMobile && this.mobileOpen,
          MODE__mobile__closed: this.isMobile && !this.mobileOpen,
          isSmallWidth: isSmallWidth,
          isSmallHeight: isSmallHeight,
        })}
      >
        ${this.isLoading ? html`<div class="globalOverlay"></div>` : ""}
        ${this.isMobile && !this.mobileOpen
          ? html`<div class="MODE__mobile__closed__overlay">
              <wc-button
                @click="${() => {
                  this.mobileOpen = true;
                }}"
                type="primary"
                .content="${t["openTheMap"][this.language]}"
              ></wc-button>
            </div>`
          : ""}
        ${(this.isMobile && this.mobileOpen) || !this.isMobile
          ? html`<div
                class="carsharing__language_picker ${this.currentTab === 1
                  ? "big_margin"
                  : ""}"
              >
                <wc-languagepicker
                  .supportedLanguages="${LANGUAGES}"
                  .language="${this.language}"
                  .changeLanguageAction="${(language) => {
                    this.language = language;
                  }}"
                ></wc-languagepicker>
              </div>

              <div class="carsharing__sideBar">
                <div class="carsharing__sideBar__searchBar">
                  ${render_searchPlaces.bind(this)()}
                </div>

                ${this.detailsOpen
                  ? html`<div class="carsharing__sideBar__details mt-4px">
                      ${render_details.bind(this)()}
                    </div>`
                  : ""}
                ${this.filtersOpen
                  ? html`<div class="carsharing__sideBar__filters mt-4px">
                      ${render_filters.bind(this)()}
                    </div>`
                  : ""}
              </div>`
          : null}

        <div id="map"></div>
        ${!this.isMobile || (this.isMobile && this.mobileOpen)
          ? render__mapControls.bind(this)()
          : null}
      </div>
    `;
  }
}

customElements.get("odh-carsharing") ||
  customElements.define("odh-carsharing", Carsharing);
