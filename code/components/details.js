import Chart from "chart.js";
import dayjs from "dayjs";
import { html } from "lit-element";
import { SIDE_MODAL_ROW_TYPES } from "../shared_components/sideModalRow/sideModalRow";
import { t } from "../translations";

export function render_details() {
  const {
    scoordinate,
    sname,
    smetadata,
    lastChange,
    sdatatypes
  } = this.currentStation;

  if (sdatatypes === undefined) {
    return html` <div class="details">
      <div class="header">
        <wc-sidemodal-header
          .type="title"
          .tTitle="${sname}"
          .tLinkedTagText=""
          .tOptionalLink="${!this.disableParkingDirections &&
          scoordinate.lat !== undefined &&
          scoordinate.lng !== undefined
            ? {
                text: t["directions"][this.language],
                url: `http://www.google.com/maps/place/${scoordinate.lat},${scoordinate.lng}`,
              }
            : undefined}"
          .closeModalAction="${() => {
            this.detailsOpen = false;
          }}"
        ></wc-sidemodal-header>
      </div>
      <div>
        <wc-divider></wc-divider>
      </div>
      <div>
        <div>
          <p class="caption">${t["details"][this.language]}</p>
        </div>
        <wc-sidemodal-row
          .type="${SIDE_MODAL_ROW_TYPES.vertical}"
          .title="${t["address"][this.language]}"
        ></wc-sidemodal-row>
      </div>
    </div>`;
  }

  const occupiedSpots = sdatatypes["occupied"]
    ? sdatatypes["occupied"]["tmeasurements"][0]["mvalue"]
    : "---";
  const availableVehicles = smetadata.availableVehicles;

  return html` <div class="details">
    <div class="header">
      <wc-sidemodal-header
        .type="title"
        .tTitle="${sname}"
        .tLinkedTagText="${typeof occupiedSpots === "number" &&
        parkingCapacity - occupiedSpots <= 0
          ? t["tag__free"][this.language]
          : ""}"
        .tOptionalLink="${!this.disableDirections &&
        scoordinate.y !== undefined &&
        scoordinate.x !== undefined
          ? {
              text: t["directions"][this.language],
              url: `http://www.google.com/maps/place/${scoordinate.y},${scoordinate.x}`,
            }
          : undefined}"
        .closeModalAction="${() => {
          this.detailsOpen = false;
        }}"
      ></wc-sidemodal-header>
    </div>
    <div>
      <wc-divider></wc-divider>
    </div>
    <div>
      <div>
        <p class="caption">${t["details"][this.language]}</p>
      </div>
      <wc-sidemodal-row
        .type="${SIDE_MODAL_ROW_TYPES.horizontal}"
        .title="avaiable vechicle tanslate please"
        .text="${availableVehicles}"
      ></wc-sidemodal-row>

      <wc-sidemodal-row
        .type="${SIDE_MODAL_ROW_TYPES.vertical}"
        .title="${t["lastUpdate"][this.language]}"
        .text="${dayjs(lastChange).format("DD/MM/YYYY HH:mm")}"
      ></wc-sidemodal-row>

    </div>
  </div>`;
}
