// SPDX-FileCopyrightText: 2021 NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import greenIcon from "../assets/pins/marker_green.svg";
import orangeIcon from "../assets/pins/marker_orange.svg";
import redIcon from "../assets/pins/marker_red.svg";

import Leaflet from "leaflet";


export const getPin = (value, maxValue) => {
  var pin;
  if (value === undefined || value <= 0) {
    pin = redIcon;
  } else if (value <= maxValue / 2) {
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
