import "@babel/polyfill";
import leafletStyle from "leaflet/dist/leaflet.css";
import { css, html, unsafeCSS } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { debounce as _debounce } from "lodash";
import { requestGetCoordinatesFromSearch } from "./api/poi";
import { BaseParking } from "./baseClass";
import { render_details } from "./components/details";
import { render_filters } from "./components/filters";
import { render__mapControls } from "./components/mapControls";
import { render_searchPlaces } from "./components/searchPlaces";
import {
  drawStationsOnMap,
  drawUserOnMap,
  initializeMap,
} from "./mainClassMethods/map";
import { observedProperties } from "./observedProperties";
import "./shared_components/button/button";
import "./shared_components/checkBox/checkBox";
import "./shared_components/divider/divider";
import "./shared_components/dropdown/dropdown";
import "./shared_components/languagePicker/languagePicker";
// Shared components
import "./shared_components/searchBar/searchBar";
import "./shared_components/sideModalHeader/sideModalHeader";
import "./shared_components/sideModalRow/sideModalRow";
import "./shared_components/sideModalTabs/sideModalTabs";
import "./shared_components/tag/tag";
import { t } from "./translations";
import { isMobile, LANGUAGES } from "./utils";
import ParkingStyle from "./odh-parking.scss";

class Parking extends BaseParking {
  static get properties() {
    return observedProperties;
  }

  static get styles() {
    return css`
      /* Map */
      ${unsafeCSS(leafletStyle)}
      ${unsafeCSS(ParkingStyle)}
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
        this.map.off();
        this.map.remove();
        this.isLoading = true;
        initializeMap
          .bind(this)()
          .then(() => {
            drawUserOnMap.bind(this)();
            drawStationsOnMap
              .bind(this)()
              .then(() => {
                this.isLoading = false;
              });
          });
      }
    });
  }

  handleSearchBarFilterAction = () => {
    this.detailsOpen = false;
    this.filtersOpen = !this.filtersOpen;
  };

  debounced__request__get_coordinates_from_search = _debounce(
    requestGetCoordinatesFromSearch.bind(this),
    500
  );

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
      if (this.shadowRoot.querySelector(".parking")) {
        isSmallWidth =
          this.shadowRoot.querySelector(".parking").clientWidth <= 400;
      }
    }

    let height = `${this.height}`;

    if (this.height.includes("px")) {
      isSmallHeight = parseInt(this.height.replace("px")) <= 400;
    } else if (this.height.includes("%")) {
      if (this.shadowRoot.querySelector(".parking")) {
        height = `${this.shadowRoot.querySelector(".parking").clientHeight}px`;
        isSmallHeight =
          this.shadowRoot.querySelector(".parking").clientHeight <= 400;
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
          parking: true,
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
                class="parking__language_picker ${this.currentTab === 1
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

              <div class="parking__sideBar">
                <div class="parking__sideBar__searchBar">
                  ${render_searchPlaces.bind(this)()}
                </div>

                ${this.detailsOpen
                  ? html`<div class="parking__sideBar__details mt-4px">
                      ${render_details.bind(this)()}
                    </div>`
                  : ""}
                ${this.filtersOpen
                  ? html`<div class="parking__sideBar__filters mt-4px">
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

customElements.get("odh-parking") ||
  customElements.define("odh-parking", Parking);
