// SPDX-FileCopyrightText: 2021 NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { BASE_PATH_MOBILITY, ORIGIN } from "./config";


export const requestCarsharingStations = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingStation/*/latest?where=sactive.eq.true&select=scoordinate,scode,smetadata,sname,sdatatypes` + ORIGIN
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
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/*/latest?where=sactive.eq.true,pcode.eq."${scode}"&select=smetadata,sdatatypes` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestCarBrandsOfStations = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/*/latest?limit=200&select=smetadata.brand,pcode&where=sactive.eq.true&distinct=true&origin=webcomp-carsharing` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestCarsharingCarBrands = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/*/latest?limit=200&select=smetadata.brand&where=sactive.eq.true&distinct=true&origin=webcomp-carsharing` + ORIGIN
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};