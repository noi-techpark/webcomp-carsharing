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
    sdatatypes,
    lastChange,
  } = this.currentStation;
  const { mainaddress, municipality } = smetadata;

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
          .text="${mainaddress || municipality}"
        ></wc-sidemodal-row>
      </div>
    </div>`;
  }

  const occupiedSpots = sdatatypes["occupied"]
    ? sdatatypes["occupied"]["tmeasurements"][0]["mvalue"]
    : "---";
  const parkingCapacity = smetadata.capacity;

  const forecast1 =
    sdatatypes["parking-forecast-60"]["tmeasurements"][0]["mvalue"];
  const forecast2 =
    sdatatypes["parking-forecast-120"]["tmeasurements"][0]["mvalue"];
  const forecast3 =
    sdatatypes["parking-forecast-180"]["tmeasurements"][0]["mvalue"];
  const forecast4 =
    sdatatypes["parking-forecast-240"]["tmeasurements"][0]["mvalue"];

  const now = dayjs();

  const checkIfTagInterval = setInterval(() => {
    if (
      this.shadowRoot.getElementById("IDForecastChart") &&
      !this.disableParkingForecast
    ) {
      const forecastChart = new Chart(
        this.shadowRoot.getElementById("IDForecastChart"),
        {
          type: "line",
          data: {
            labels: [
              "Now",
              now.add(1, "hour").format("hh:mm"),
              now.add(2, "hour").format("hh:mm"),
              now.add(3, "hour").format("hh:mm"),
              now.add(4, "hour").format("hh:mm"),
            ],
            datasets: [
              {
                backgroundColor: "white",
                borderColor: "#333333",
                data: [
                  occupiedSpots,
                  forecast1,
                  forecast2,
                  forecast3,
                  forecast4,
                ],
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 5,
                showLine: true,
              },
            ],
          },
          options: {
            responsive: false,
            title: {
              display: false,
            },
            legend: {
              display: false,
            },
          },
        }
      );
      clearInterval(checkIfTagInterval);
    }
  }, 100);

  return html` <div class="details">
    <div class="header">
      <wc-sidemodal-header
        .type="title"
        .tTitle="${sname}"
        .tLinkedTagText="${typeof occupiedSpots === "number" &&
        parkingCapacity - occupiedSpots <= 0
          ? t["tag__free"][this.language]
          : ""}"
        .tOptionalLink="${!this.disableParkingDirections &&
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
        .title="${t["totalSeats"][this.language]}"
        .text="${parkingCapacity}"
      ></wc-sidemodal-row>
      <wc-sidemodal-row
        .type="${SIDE_MODAL_ROW_TYPES.horizontal}"
        .title="${t["occupiedSeats"][this.language]}"
        .text="${occupiedSpots}"
      ></wc-sidemodal-row>
      <wc-sidemodal-row
        .type="${SIDE_MODAL_ROW_TYPES.vertical}"
        .title="${t["address"][this.language]}"
        .text="${mainaddress || municipality}"
      ></wc-sidemodal-row>

      <wc-sidemodal-row
        .type="${SIDE_MODAL_ROW_TYPES.vertical}"
        .title="${t["lastUpdate"][this.language]}"
        .text="${dayjs(lastChange).format("DD/MM/YYYY HH:mm")}"
      ></wc-sidemodal-row>

      <div>
        <p class="caption">${t["legend"][this.language]}</p>
      </div>

      <div class='legend'>
        <div style='top: 11px !important; left: 0' class="custom-div-icon-dot"></div>
        <span>&mapstoleft; ${t["pulsingDot"][this.language]}</span>
      </div>

      ${!this.disableParkingForecast
        ? html`
            <div>
              <p class="caption">${t["forecasts"][this.language]}</p>

              <div class="forecast_graph__container">
                <canvas id="IDForecastChart" width="260" height="132"></canvas>
              </div>
            </div>
          `
        : ""}
    </div>
  </div>`;
}
