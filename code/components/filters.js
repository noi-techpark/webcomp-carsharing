// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { html } from "lit-element";
import { t } from "../translations";

export function render_filters() {
  let filtersNumber = 0;
  if (this.filters.availability) {
    filtersNumber = filtersNumber + 1;
  }

  let brandNameCheckboxes = [];

  for (let brandName in this.filters) {

    if (brandName != "availability" && brandName != "radius") {
      if (!this.filters[brandName]) {
        filtersNumber++;
      }

      brandNameCheckboxes.push(html`
    <div>
      <div class="options_container">
        <wc-checkbox
          .value="${this.filters[brandName]}"
          .action="${({ value }) => {
          this.filters = { ...this.filters, [brandName]: value };
        }}"
          .label="${brandName}"
          .name="availability"
        ></wc-checkbox>
      </div>
    </div>`);
    }
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
      this.filters = { ...this.defaultFilters };
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
            .label="${t["onlyShowCarsharingStationsWithAvailableSpots"][
    this.language
    ]}"
            .name="availability"
          ></wc-checkbox>
        </div>
      </div>
      
      <div>
        <p class="caption">${t["cars"][this.language]}</p>
        ${brandNameCheckboxes}
      </div>

    </div>
  </div>`;
}
