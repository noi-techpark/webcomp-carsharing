const DEFAULT_GEOLOCATION_TIMEOUT = 10000;
export const LANGUAGES = {
  EN: "en",
  DE: "de",
  IT: "it",
};

export const isMobile = () => {
  return document.body.offsetWidth < 992;
};

export function getCurrentPosition(options = {}) {
  //                 milli * s * m   = 1h
  const maximumAge = 1000 * 60 * 60;
  return new Promise((resolve, reject) => {
    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      return navigator.geolocation.getCurrentPosition(resolve, reject, {
        maximumAge,
        timeout: DEFAULT_GEOLOCATION_TIMEOUT,
        ...options,
      });
    } else {
      reject(); // geolocalization probably not supported
    }
  });
}

export function get_system_language() {
  const locale = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  const lang = locale.substr(0, 2);
  return Object.values(LANGUAGES).includes(lang) ? lang : LANGUAGES.EN;
}

export function getLatLongFromStationDetail(o) {
  return { lat: o.y, lng: o.x };
}
