import { html } from "lit-element";
import findPositionBlueIcon from "../assets/find-position-blue.svg";
import { t } from "../translations";

export function render_searchPlaces() {
  const handle_onchange = (value) => {
    if (value) {
      this.detailsOpen = false;
      this.hereMapsQuery = value;
      this.debounced__request__get_coordinates_from_search(value);
      this.filtersOpen = false;
    } else {
      this.searchPlacesFound = {};
    }
  };

  const manageMap = (lat, lng) => {
    this.currentLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    this.current_station = {};
    this.searchPlacesFound = {};
    this.filtersOpen = false;
    this.map.flyTo([lat, lng]);
    this.map.removeLayer(this.layer_user);
    this.isLoading = false;
  };

  const handleMoveToCurrentPosition = () => {
    try {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          this.isLoading = true;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              manageMap(latitude, longitude);
            },
            () => {}
          );
        } else {
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.log(error);
      this.isLoading = false;
    }
  };

  const handleMoveToPlace = (lat, lng) => {
    this.isLoading = true;
    this.searchPlacesFound = {};
    this.hereMapsQuery = "";
    manageMap(lat, lng);
  };

  const handleFocusInput = () => {
    this.debounced__request__get_coordinates_from_search(this.hereMapsQuery);
    if (this.hereMapsQuery.length) {
      this.filtersOpen = false;
    }
  };

  const render__places_list = () => {
    const keys = Object.keys(this.searchPlacesFound);
    return html`
      <div class="searchBox__resoult_list">
        <ul>
          <li @click="${handleMoveToCurrentPosition}" class="">
            <img class="" src="${findPositionBlueIcon}" alt="" />
            ${t.my_location[this.language]}
          </li>
          ${keys.map((key) => {
            if (this.searchPlacesFound[key].length) {
              return html`
                <span class="caption uppercase bold block mt-16px">${key}</span>
                ${this.searchPlacesFound[key].map((o) => {
                  return html`
                    <li
                      @click="${async () => {
                        this.detailsOpen = false;
                        handleMoveToPlace(o.position[0], o.position[1]);
                      }}"
                      class=""
                    >
                      ${o.title}
                    </li>
                  `;
                })}
              `;
            }
            return html``;
          })}
        </ul>
      </div>
    `;
  };

  let filtersNumber = 0;
  if (this.filters.availability) {
    filtersNumber = filtersNumber + 1;
  }

  const checkIfPlacesFound = (results) => {
    const keys = Object.keys(results);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (results[k].length) {
        return true;
      }
    }
    return false;
  };

  return html`
    <div class="searchBox">
      <wc-searchbar
        .searchValue="${this.hereMapsQuery}"
        placeHolder="${t.search[this.language]}..."
        .filtersNumber="${filtersNumber}"
        .filtersAction="${this.handleSearchBarFilterAction}"
        .action="${handle_onchange}"
        @focus=${handleFocusInput}
      ></wc-searchbar>

      ${checkIfPlacesFound(this.searchPlacesFound) && this.hereMapsQuery.length
        ? render__places_list()
        : ""}
    </div>
  `;
}
