// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import dayjs from "dayjs";
import { html } from "lit-element";
import { SIDE_MODAL_ROW_TYPES } from "../shared_components/sideModalRow/sideModalRow";
import { t } from "../translations";
import tooltipIcon from "../assets/Tooltip2.svg";



export function render_details() {
  const station = this.currentStation;

  const width = 150;
  const height = 150;

  const swidth = 80;
  const sheight = 50;
  const fontSize = 14;

  const bookCarUrl = 'https://www.alpsgo.it';
  const directionsUrl = `http://www.google.com/maps/place/${station.coordinates.lat},${station.coordinates.lng}`;

  const carDetails = [];

  // Use the normalized carsByBrands data
  for (let brandName in station.carsByBrands) {
    const brandData = station.carsByBrands[brandName];
    const delay = 250;

    carDetails.push(html`<wc-radial-progress
      .minValue=0
      .maxValue=${brandData.total}
      .value=${brandData.available}
      .width=${swidth}
      .height=${sheight}
      .text=${brandName}
      .fontSize=${fontSize}
      .delay=${delay}
      .id=${station.name}
     ></wc-radial-progress>`);
  }

  return html` <div class="details">
    <div class="header">
      <wc-sidemodal-header
        .type="title"
        .tTitle="${station.name}"
        .tSubtitle=${dayjs(station.lastUpdated).format("MMM DD, YYYY HH:mm")}
        .closeModalAction="${() => {
      this.detailsOpen = false;
    }}"
      ></wc-sidemodal-header>
    </div>
    <div>
     <wc-divider></wc-divider>
    </div>
    <wc-radial-progress
    .maxValue=${station.maxVehicles}
    .value=${station.availableVehicles}
    .width=${width}
    .height=${height}
    .id=${station.name}
     ></wc-radial-progress>

     <div class="detailDescription">
       <span>${t["bookableCars"][this.language]}</span>
       <img class="info-icon" src="${tooltipIcon}" @click="${() => this.toggleTooltip()}" alt="Info" />
     </div>
     
     ${this.showTooltip ? html`
       <div class="info-explanation">
         ${t["bookingToleranceInfo"][this.language]}
       </div>
     ` : ''}

     <div class="carsAtStationHeader">
       <span>${t["carsAtStation"][this.language]}</span>
     </div>

        ${carDetails}

    <div>
      <wc-detail-button @click="${() => {
        window.open(bookCarUrl, '_blank');
      }}"
      .text=${t["bookCar"][this.language]}
      ></wc-detail-button>
    </div>

    <div>
      <wc-detail-button @click="${() => {
        window.open(directionsUrl, '_blank');
      }}"
      .text=${t["directions"][this.language]}
      ></wc-detail-button>
    </div>

    </div>
  </div>`;
}
