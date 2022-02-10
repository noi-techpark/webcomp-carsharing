import { BASE_PATH_MOBILITY } from "./config";


export const requestCarsharingStations = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/tree,node/CarsharingStation/*/latest?where=sactive.eq.true&select=scoordinate,scode,smetadata`
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
      `${BASE_PATH_MOBILITY}/tree,node/CarsharingCar/*/latest?where=sactive.eq.true,pcode.eq."${scode}"&select=smetadata`
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};
