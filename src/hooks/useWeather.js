import { useState, useEffect } from 'react';
import { STORAGE_KEYS, WEATHER_CONFIG } from '../config';

const {
  CACHE_TTL_MS,
  GEOLOCATION_TIMEOUT_MS,
  GEOLOCATION_MAX_AGE_MS,
  ENDPOINTS,
  DEFAULT_READING,
  CONDITIONS,
  LOCATION,
} = WEATHER_CONFIG;

function resolveConditionLabel(wmoCode, temperatureC) {
  if (wmoCode === 0) return temperatureC >= 24 ? CONDITIONS.SUNNY : CONDITIONS.CLEAR;
  if (wmoCode === 1 || wmoCode === 2) return CONDITIONS.PARTLY_CLOUDY;
  if (wmoCode === 3) return CONDITIONS.OVERCAST;
  if (wmoCode === 45 || wmoCode === 48) return CONDITIONS.MISTY;
  if (wmoCode >= 51 && wmoCode <= 55) return CONDITIONS.GENTLE_DRIZZLE;
  if (wmoCode >= 61 && wmoCode <= 65) return CONDITIONS.RAIN;
  if (wmoCode >= 71 && wmoCode <= 77) return CONDITIONS.SNOW;
  if (wmoCode >= 80 && wmoCode <= 82) return CONDITIONS.PASSING_SHOWERS;
  if (wmoCode >= 95) return CONDITIONS.THUNDERSTORM;

  if (temperatureC <= 10) return CONDITIONS.CRISP;
  if (temperatureC <= 18) return CONDITIONS.COOL;
  if (temperatureC <= 25) return CONDITIONS.MILD;
  return CONDITIONS.WARM;
}

function readCachedWeather(maxAgeMs = CACHE_TTL_MS) {
  try {
    const rawCache = localStorage.getItem(STORAGE_KEYS.WEATHER);
    if (!rawCache) return null;
    const parsedReading = JSON.parse(rawCache);
    if (parsedReading?.text && Date.now() - parsedReading.timestamp < maxAgeMs) {
      return parsedReading;
    }
  } catch {
    // QuotaExceeded or JSON corruption defaults to network lookup
  }
  return null;
}

function persistCachedWeather(reading) {
  try {
    localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(reading));
  } catch {
    // Gracefully ignore local storage unavailability
  }
}

async function fetchIpCoordinates() {
  try {
    const geoResponse = await fetch(ENDPOINTS.IP_GEOLOCATION);
    if (!geoResponse.ok) return null;
    const geoData = await geoResponse.json();
    if (geoData?.latitude && geoData?.longitude) {
      const locationLabel = geoData.city
        ? `${geoData.city}, ${geoData.country_code || ''}`.trim()
        : '';
      return {
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        locationLabel,
      };
    }
  } catch {
    // Fall back to browser geolocation when IP service is unreachable
  }
  return null;
}

async function fetchBrowserCoordinates() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          locationLabel: LOCATION.FALLBACK_SANCTUARY,
        });
      },
      () => resolve(null),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAX_AGE_MS },
    );
  });
}

async function queryOpenMeteoForecast(latitude, longitude, locationLabel) {
  const endpoint = `${ENDPOINTS.FORECAST_BASE}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`;
  const forecastResponse = await fetch(endpoint);
  if (!forecastResponse.ok) {
    throw new Error(`Weather forecast endpoint failed with HTTP ${forecastResponse.status}`);
  }
  const forecastPayload = await forecastResponse.json();
  if (!forecastPayload?.current) return null;

  const temperatureC = Math.round(forecastPayload.current.temperature_2m);
  const relativeHumidity = Math.round(forecastPayload.current.relative_humidity_2m);
  const condition = resolveConditionLabel(forecastPayload.current.weather_code, temperatureC);

  return {
    temp: temperatureC,
    humidity: relativeHumidity,
    condition,
    text: `${condition} ${temperatureC}°C · ${relativeHumidity}% RH`,
    location: locationLabel,
    timestamp: Date.now(),
    loading: false,
  };
}

export function useWeather() {
  const [weatherReading, setWeatherReading] = useState(() => {
    const cached = readCachedWeather(CACHE_TTL_MS * 2);
    return cached || DEFAULT_READING;
  });

  useEffect(() => {
    let isCancelled = false;

    async function loadTelemetry() {
      const activeCache = readCachedWeather(CACHE_TTL_MS);
      if (activeCache) {
        if (!isCancelled) setWeatherReading({ ...activeCache, loading: false });
        return;
      }

      const coordinates = (await fetchIpCoordinates()) || (await fetchBrowserCoordinates());
      if (!coordinates || isCancelled) {
        if (!isCancelled) setWeatherReading((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const freshReading = await queryOpenMeteoForecast(
          coordinates.latitude,
          coordinates.longitude,
          coordinates.locationLabel,
        );
        if (freshReading && !isCancelled) {
          setWeatherReading(freshReading);
          persistCachedWeather(freshReading);
        }
      } catch {
        if (!isCancelled) setWeatherReading((prev) => ({ ...prev, loading: false }));
      }
    }

    loadTelemetry();
    const refreshTimer = setInterval(loadTelemetry, CACHE_TTL_MS);
    return () => {
      isCancelled = true;
      clearInterval(refreshTimer);
    };
  }, []);

  return weatherReading;
}
