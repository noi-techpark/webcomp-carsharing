// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import dayjs from "dayjs";
import { html } from "lit-element";
import { SIDE_MODAL_ROW_TYPES } from "../shared_components/sideModalRow/sideModalRow";
import { t } from "../translations";



export function render_details() {
  const {
    scoordinate,
    sname,
    smetadata,
    mvalue,
    mvalidtime,
    cars
  } = this.currentStation;

  const actuallyAvailableVehicles = mvalue;
  const lastChange = mvalidtime;
  const availableVehicles = smetadata.availableVehicles;

  const width = 150;
  const height = 150;

  const swidth = 80;
  const sheight = 50;
  const fontSize = 14;

  const bookCarUrl = 'https://booking.carsharing.bz.it';
  const directionsrUrl = 'http://www.google.com/maps/place/'+ scoordinate.y+ ',' + scoordinate.x;


  let carByBrands = {};
  const carDetails = [];

  for (let station in cars) {
    let brandName = cars[station].smetadata.brand;
    let available = cars[station].mvalue === 0 ? 1 : 0;
    if (brandName in carByBrands) {
      carByBrands[brandName]["availability"] += available;
      carByBrands[brandName]["maxAvailability"] += 1;

    } else {
      carByBrands[brandName] = {};
      carByBrands[brandName]["availability"] = 0;
      carByBrands[brandName]["maxAvailability"] = 1;
      carByBrands[brandName]["availability"] += available;
    }
  }

  for (let key in carByBrands) {
    let brandName = key;
    let available = carByBrands[key]["availability"];
    let maxAvailability = carByBrands[key]["maxAvailability"];
    const delay = 250;

    carDetails.push(html`<wc-radial-progress
    .minValue=0
    .maxValue=${maxAvailability}
    .value=${available}
    .width=${swidth}
    .height=${sheight}
    .text=${brandName}
    .fontSize=${fontSize}
    .delay=${delay}
    .id=${sname}
     ></wc-radial-progress>`);
  }


  return html` <div class="details">
    <div class="header">
      <wc-sidemodal-header
        .type="title"
        .tTitle="${sname}"
        .tSubtitle=${dayjs(lastChange).format("MMM DD, YYYY HH:mm")}
        .closeModalAction="${() => {
      this.detailsOpen = false;
    }}"
      ></wc-sidemodal-header>
    </div>
    <div>
     <wc-divider></wc-divider>
    </div>
    <wc-radial-progress
    .maxValue=${availableVehicles}
    .value=${actuallyAvailableVehicles}
    .width=${width}
    .height=${height}
    .id=${sname}
     ></wc-radial-progress>

     <div class="detailDescription">${t["availableCars"][this.language]}</div>

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
        window.open(directionsrUrl, '_blank');
      }}"
      .text=${t["directions"][this.language]}
      ></wc-detail-button>
    </div>

    </div>
  </div>`;
}
