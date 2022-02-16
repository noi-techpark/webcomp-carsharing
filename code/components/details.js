import dayjs from "dayjs";
import { html } from "lit-element";
import { SIDE_MODAL_ROW_TYPES } from "../shared_components/sideModalRow/sideModalRow";
import { t } from "../translations";



export function render_details() {
  const {
    pcoordinate,
    pname,
    cars,
    availability
  } = this.currentStation;

  const actuallyAvailableVehicles = availability
  const lastChange = cars[Object.keys(cars)[0]]["sdatatypes"]["availability"]["tmeasurements"][0]["mvalidtime"]

  const availableVehicles = Object.keys(cars).length;

  const width = 300;
  const height = 150;

  const swidth = 80;
  const sheight = 50;
  const fontSize = 14;

  const bookCarUrl = 'https://booking.carsharing.bz.it';
  const directionsrUrl = 'http://www.google.com/maps/place/'+ pcoordinate.y+ ',' + pcoordinate.x;


  let carByBrands = {};
  const carDetails = [];

  for (let station in cars) {
    let brandName = cars[station].smetadata.brand;
    let available = cars[station]["sdatatypes"]["availability"]["tmeasurements"][0]["mvalue"] === 0 ? 1 : 0;
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

    carDetails.push(html`<wc-radial-progress
    .minValue=0
    .maxValue=${maxAvailability}
    .value=${available}
    .width=${swidth}
    .height=${sheight}
    .text=${brandName}
    .fontSize=${fontSize}
     ></wc-radial-progress>`);
  }


  return html` <div class="details">
    <div class="header">
      <wc-sidemodal-header
        .type="title"
        .tTitle="${pname}"
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
     ></wc-radial-progress>

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
