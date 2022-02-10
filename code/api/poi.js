import { BASE_PATH_MOBILITY, TOURISM_PATH_MOBILITY } from "./config";

export async function requestGetCoordinatesFromSearch(query) {
  const r = 150 * 1000;
  try {
    if (query) {
      let formattedTourismParkingStationsData = [];
      const tourismParkingStationsRequest = await fetch(
        `${TOURISM_PATH_MOBILITY}/Poi?pagenumber=1&poitype=64&subtype=2&pagesize=-1&searchfilter=${query}`
      );
      const tourismParkingStationsResponse = await tourismParkingStationsRequest.json();
      if (tourismParkingStationsResponse.Items) {
        formattedTourismParkingStationsData = tourismParkingStationsResponse.Items.map(
          (o) => {
            if (o.GpsInfo[0]) {
              return {
                position: [o.GpsInfo[0].Latitude, o.GpsInfo[0].Longitude],
                title: o.Detail[this.language].Title || o.Shortname || "---",
              };
            }
          }
        );
      }

      //

      let formattedMobilityParkingStationsData = [];
      const mobilityParkingStationsRequest = await fetch(
        `${BASE_PATH_MOBILITY}/tree,node/ParkingStation/*/latest?where=and(or(smetadata.name_it.ire."${query}",smetadata.name_en.ire."${query}",smetadata.name_de.ire."${query}",sname.ire."${query}"),sactive.eq.true)&select=smetadata,scoordinate,sname`
      );
      const mobilityParkingStationsResponse = await mobilityParkingStationsRequest.json();
      if (
        mobilityParkingStationsResponse.data &&
        mobilityParkingStationsResponse.data.ParkingStation &&
        mobilityParkingStationsResponse.data.ParkingStation.stations
      ) {
        formattedMobilityParkingStationsData = Object.values(
          mobilityParkingStationsResponse.data.ParkingStation.stations
        ).map((item) => {
          return {
            position: [item.scoordinate.y, item.scoordinate.x],
            title:
              item.smetadata[`name_${this.language}`] || item.sname || "---",
          };
        });
      }

      let formattedHereData = [];
      if (
        !formattedTourismParkingStationsData.length &&
        !formattedMobilityParkingStationsData.length &&
        process.env.DOTENV.HEREMAPS_API_KEY
      ) {
        const hereResponse = await fetch(
          `https://places.ls.hereapi.com/places/v1/browse?apiKey=${process.env.DOTENV.HEREMAPS_API_KEY}&in=46.31,11.26;r=${r}&q=${query}`,
          {
            method: "GET",
            headers: new Headers({
              Accept: "application/json",
            }),
          }
        );
        const hereData = await hereResponse.json();
        formattedHereData = hereData.results.items.map((item) => {
          return {
            position: item.position,
            title: item.title,
          };
        });
      }

      //

      const tourismResponse = await fetch(
        `https://tourism.opendatahub.bz.it/api/Poi?pagenumber=1&pagesize=10000&poitype=511&searchfilter=${query}`,
        {
          method: "GET",
          headers: new Headers({
            Accept: "application/json",
          }),
        }
      );
      const tourismData = await tourismResponse.json();
      const formattedTourismData = tourismData.Items.map((item) => {
        return {
          position: [item.GpsInfo[0].Latitude, item.GpsInfo[0].Longitude],
          title: item.Detail[this.language].Title,
        };
      });

      this.searchPlacesFound = {
        "Open Data Hub": [
          ...formattedTourismParkingStationsData,
          ...formattedMobilityParkingStationsData,
        ],
        "Other results": [...formattedTourismData, ...formattedHereData],
      };
    }
  } catch (error) {
    console.error(error);
    this.searchPlacesFound = {};
  }
}
