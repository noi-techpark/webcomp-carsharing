// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { BASE_PATH_MOBILITY, ORIGIN } from "./config";

export const requestCarsharingStations = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingStation/number-available/latest?where=sactive.eq.true&select=scoordinate,scode,smetadata,sname,sdatatypes` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestCarsharingCars = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/availability/latest?where=sorigin.eq.%22AlpsGo%22,sactive.eq.true&select=scode,smetadata,mvalue,mvalidtime` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestCarsharingCarsOfStation = async ({ scode }) => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/current-station/latest?limit=-1&offset=0&where=sorigin.eq.%22AlpsGo%22,sactive.eq.true,mvalue.eq."${scode}"&select=scode` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestCarsharingCar = async ({ scode }) => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/availability/latest?limit=-1&offset=0&where=sorigin.eq.%22AlpsGo%22,sactive.eq.true,scode.eq."${scode}"` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestStationCarRelations = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/current-station/latest?where=sorigin.eq."AlpsGo",sactive.eq.true&select=scode,mvalue` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};