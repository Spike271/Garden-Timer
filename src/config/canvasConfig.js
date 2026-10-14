// Canvas rendering constants. Sky bands and celestial arc match the landing page showcase
// (landing.js) so the app and the sample look identical at the same local time.
export const CANVAS_CONFIG = Object.freeze({
  SKY: Object.freeze({
    // Hour bands in local time (24h). Gradient stops top → bottom.
    BANDS: Object.freeze({
      DAWN: Object.freeze({ from: 5, to: 8, stops: Object.freeze(['#d4c4fb', '#fed6e3', '#fef9f0']) }),
      DAY: Object.freeze({ from: 8, to: 17, stops: Object.freeze(['#bfe3f5', '#f4f8e6']) }),
      GOLDEN: Object.freeze({ from: 17, to: 20, stops: Object.freeze(['#fbc2eb', '#fda085', '#f6d365']) }),
      // Fallback for 20:00 → 05:00
      NIGHT: Object.freeze({ stops: Object.freeze(['#152238', '#2c3e50']) }),
    }),
    // Sun is shown 06:00–18:00, moon otherwise.
    DAY_START_HOUR: 6,
    DAY_END_HOUR: 18,
    STARS: Object.freeze({ COUNT: 28, SEED: 42, MAX_Y_RATIO: 0.72, FILL: 'rgba(255, 255, 255, 0.85)' }),
  }),

  // Arc the sun/moon travel: left → right, rising to Y_BASE - Y_HEIGHT at midday/midnight.
  CELESTIAL: Object.freeze({
    X_START: 0.12,
    X_SPAN: 0.76,
    Y_BASE: 0.52,
    Y_HEIGHT: 0.42,
    SUN: Object.freeze({
      CORE_COLOR: '#f5c451',
      GLOW_INNER: '#fff4cc',
      GLOW_OUTER: 'rgba(245, 196, 81, 0)',
      CORE_RADIUS: 14,
      GLOW_RADIUS: 22,
    }),
    MOON: Object.freeze({
      CORE_COLOR: '#e8ecf2',
      HALO_COLOR: 'rgba(232, 236, 242, 0.25)',
      CORE_RADIUS: 11,
      HALO_RADIUS: 18,
    }),
  }),

  GROUND: Object.freeze({
    TOP_RATIO: 0.9,
    SOIL_COLOR: '#6b4f2a',
    PEBBLE_COLOR: '#9aa0a6',
    NIGHT_SOIL_COLOR: '#4a3620',
    NIGHT_PEBBLE_COLOR: '#5b5f66',
    PEBBLE_COUNT: 7,
  }),
});
