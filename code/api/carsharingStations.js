import { BASE_PATH_MOBILITY } from "./config";


const requestCarsharingCars = async () => {
  try {
    const request = await fetch(
      `${BASE_PATH_MOBILITY}/tree,node/CarsharingCar/*/latest?where=sactive.eq.true&select=sparent,sdatatypes,sname,smetadata`
    );
    if (request.status !== 200) {
      throw new Error(request.statusText);
    }
    return await request.json();
  } catch (error) {
    console.log(error);
  }
};

// converts in object with stations objects with nested cars instead of cars with nested stations
// also contains branDnames for filters
export const getFormattedCarsharingData = async () => {
  let cars = await requestCarsharingCars();
  cars = cars["data"]["CarsharingCar"]["stations"];

  let data = {};
  data["brandNames"] = {};
  data["stations"] = {};


  Object.values(cars).forEach(value => {
    if (!(value.sparent.pcode in data["stations"])) {
      data["stations"][value.sparent.pcode] = value.sparent;
      data["stations"][value.sparent.pcode].cars = [];
    }
    
    let car = { ...value };
    delete car.sparent;
    data["stations"][value.sparent.pcode].cars.push(car);

    // get all brand names for filter
    if(!(car.smetadata.brand in data.brandNames)){
      data.brandNames[car.smetadata.brand] = 0;
    }
    data.brandNames[car.smetadata.brand]++;
  });

  // count available cars of data
  for(let station in data["stations"]){
    let counter = 0;
    Object.values(data["stations"][station].cars).forEach(car => {
      if(car.sdatatypes.availability.tmeasurements[0].mvalue === 0)
        counter++;
    });
    data["stations"][station]["availability"] = counter;
  }

  return data;
}