export const WEATHER_CONFIG = Object.freeze({
  CACHE_TTL_MS: 25 * 60 * 1000,
  GEOLOCATION_TIMEOUT_MS: 3000,
  GEOLOCATION_MAX_AGE_MS: 15 * 60 * 1000,
  ENDPOINTS: Object.freeze({
    IP_GEOLOCATION: 'https://get.geojs.io/v1/ip/geo.json',
    FORECAST_BASE: 'https://api.open-meteo.com/v1/forecast',
  }),
  DEFAULT_READING: Object.freeze({
    temp: 22,
    humidity: 64,
    condition: 'Mild',
    text: 'Mild 22°C · 64% RH',
    location: '',
    loading: true,
  }),
  CONDITIONS: Object.freeze({
    SUNNY: 'Sunny',
    CLEAR: 'Clear',
    PARTLY_CLOUDY: 'Partly Cloudy',
    OVERCAST: 'Overcast',
    MISTY: 'Misty',
    GENTLE_DRIZZLE: 'Gentle Drizzle',
    RAIN: 'Rain',
    SNOW: 'Snow',
    PASSING_SHOWERS: 'Passing Showers',
    THUNDERSTORM: 'Thunderstorm',
    CRISP: 'Crisp',
    COOL: 'Cool',
    MILD: 'Mild',
    WARM: 'Warm',
  }),
  LOCATION: Object.freeze({
    FALLBACK_SANCTUARY: 'Local Sanctuary',
    DEFAULT_TOOLTIP: 'Live sanctuary weather',
    formatTooltip: (locationName) =>
      locationName ? `Live sanctuary weather: ${locationName}` : 'Live sanctuary weather',
  }),
});
