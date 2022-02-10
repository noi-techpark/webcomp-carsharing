import greenIcon from "../assets/pins/marker_green.svg";
import orangeIcon from "../assets/pins/marker_orange.svg";
import redIcon from "../assets/pins/marker_red.svg";

import Leaflet from "leaflet";


export const getPin = (mvalue) => {
  var pin;
  if (mvalue === undefined || mvalue < 0) {
    pin = redIcon;
  } else if (mvalue == 1) {
    pin = orangeIcon;
  } else {
    pin = greenIcon;
  }

  return Leaflet.divIcon(
    {
      className: 'custom-div-icon',
      html: `<div><img src="${pin}" /></div>`,
      iconSize: [36, 36]
    }
  )
};
