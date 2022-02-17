import { BASE_PATH_MOBILITY } from "./config";

export const requestCarsharingStations = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingStation/*/latest?where=sactive.eq.true&select=scoordinate,scode,smetadata,sname,sdatatypes`
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
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/*/latest?where=sactive.eq.true,pcode.eq."${scode}"&select=smetadata,sdatatypes`
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
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/*/latest?limit=200&select=smetadata.brand,pcode&where=sactive.eq.true&distinct=true`
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
      `${BASE_PATH_MOBILITY}/flat,node/CarsharingCar/*/latest?limit=200&select=smetadata.brand&where=sactive.eq.true&distinct=true`
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};