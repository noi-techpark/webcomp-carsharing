import { html } from "lit-element";
import { t } from "../translations";

export function render_filters() {
  let filtersNumber = 0;
  if (this.filters.availability) {
    filtersNumber = filtersNumber + 1;
  }

  return html` <div class="filters">
    <div class="header">
      <wc-sidemodal-header
        type="filter"
        .fTitle="${filtersNumber ? filtersNumber : ""} ${t["filters"][
          this.language
        ]}"
        .fCancelFiltersText="${t["cancelFilters"][this.language]}"
        .fCancelFiltersAction="${() => {
          this.filters = { ...this.filters, availability: false };
        }}"
        .closeModalAction="${() => {
          this.filtersOpen = false;
        }}"
      ></wc-sidemodal-header>
    </div>
    <div>
      <wc-divider></wc-divider>
    </div>
    <div>
      <div>
        <p class="caption">${t["availability"][this.language]}</p>
        <div class="options_container">
          <wc-checkbox
            .value="${this.filters.availability}"
            .action="${({ value }) => {
              this.filters = { ...this.filters, availability: value };
            }}"
            .label="${t["onlyShowParkingSpacesWithAvailableSpots"][
              this.language
            ]}"
            .name="availability"
          ></wc-checkbox>
        </div>
      </div>
    </div>
  </div>`;
}
