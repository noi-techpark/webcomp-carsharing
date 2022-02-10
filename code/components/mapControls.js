import { html } from "lit-html";
import expandImage from "../assets/expand.svg";
import findPositionImage from "../assets/find-position.svg";
import minimizeImage from "../assets/minimize.svg";
import minusImage from "../assets/minus.svg";
import plusImage from "../assets/plus.svg";
import { drawUserOnMap } from "../mainClassMethods/map";
import { getCurrentPosition } from "../utils";

export function render__mapControls() {
  const handleBtnZoomIn = () => {
    this.map.setZoom(this.map.getZoom() + 1);
  };

  const handleBtnZoomOut = () => {
    this.map.setZoom(this.map.getZoom() - 1);
  };

  const handleBtnCenterMap = async () => {
    this.isLoading = true;
    try {
      const { coords } = await getCurrentPosition();
      if (coords) {
        const { latitude, longitude } = coords;
        this.currentLocation = { lat: latitude, lng: longitude };
        this.map.removeLayer(this.layer_user);
        this.map.flyTo([latitude, longitude], 13);
        drawUserOnMap.bind(this)();
      }
      this.isLoading = false;
    } catch (error) {
      console.log(error);
      this.isLoading = false;
    }
  };

  return html`
    <div class="map_controls">
      ${this.isMobile
        ? html`<div class="mt-16px">
            <wc-button
              @click="${() => {
                this.mobileOpen = !this.mobileOpen;
              }}"
              type="square"
              .image="${this.mobileOpen ? minimizeImage : expandImage}"
            ></wc-button>
          </div>`
        : ""}
      <div class="mt-16px">
        <wc-button
          @click="${handleBtnCenterMap}"
          type="square"
          .image="${findPositionImage}"
        ></wc-button>
      </div>
      <div class="mt-16px">
        <wc-button
          @click="${handleBtnZoomIn}"
          type="square"
          .image="${plusImage}"
        ></wc-button>
        <div class="mt-4px">
          <wc-button
            @click="${handleBtnZoomOut}"
            type="square"
            .image="${minusImage}"
          ></wc-button>
        </div>
      </div>
    </div>
  `;
}
