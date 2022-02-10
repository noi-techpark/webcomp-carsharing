import { BASE_PATH_MOBILITY, TOURISM_PATH_MOBILITY } from "./config";

export const requestTourismParking = async ({ language }) => {
  try {
    const request = await fetch(
      `${TOURISM_PATH_MOBILITY}/Poi?pagenumber=1&poitype=64&subtype=2&pagesize=1000&language=${language}`
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestMobilityParking = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/tree,node/ParkingStation/*/latest?where=sactive.eq.true&select=scoordinate,scode,smetadata,sdatatypes`
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

export const requestMobilityParkingDetails = async ({ scode }) => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/tree,node/ParkingStation/*/latest?where=sactive.eq.true,scode.eq."${scode}"&select=scoordinate,smetadata,scode,sdatatypes,sname`
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};
