import { CANVAS_CONFIG } from '../config';

// Pure drawing code. No React imports

const DEPTH_BY_STAGE = [0, 2, 4, 5];
const TRUNK_LEN = 80;

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a, b, t) {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
}

function isDaytime(hour) {
  const { DAY_START_HOUR, DAY_END_HOUR } = CANVAS_CONFIG.SKY;
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR;
}

function skyBandFor(hour) {
  const { DAWN, DAY, GOLDEN, NIGHT } = CANVAS_CONFIG.SKY.BANDS;
  if (hour >= DAWN.from && hour < DAWN.to) return DAWN;
  if (hour >= DAY.from && hour < DAY.to) return DAY;
  if (hour >= GOLDEN.from && hour < GOLDEN.to) return GOLDEN;
  return NIGHT;
}

// True only when the sky itself is in its night band (20:00–05:00). Stars and dark soil key off
// this so they never appear over a dawn or golden-hour gradient. The sun/moon switch stays at 06/18.
export function isNightSky(hour) {
  return skyBandFor(hour) === CANVAS_CONFIG.SKY.BANDS.NIGHT;
}

function drawSkyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach((color, i) => {
    g.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), color);
  });
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawStars(ctx, w, h) {
  const { COUNT, SEED, MAX_Y_RATIO, FILL } = CANVAS_CONFIG.SKY.STARS;
  const rand = mulberry32(SEED);
  ctx.fillStyle = FILL;
  for (let i = 0; i < COUNT; i++) {
    const sx = rand() * w;
    const sy = rand() * (h * MAX_Y_RATIO);
    const r = 0.7 + rand() * 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSun(ctx, x, y) {
  const { CORE_COLOR, GLOW_INNER, GLOW_OUTER, CORE_RADIUS, GLOW_RADIUS } =
    CANVAS_CONFIG.CELESTIAL.SUN;
  const glow = ctx.createRadialGradient(x, y, 2, x, y, GLOW_RADIUS);
  glow.addColorStop(0, GLOW_INNER);
  glow.addColorStop(0.6, CORE_COLOR);
  glow.addColorStop(1, GLOW_OUTER);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, GLOW_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = CORE_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, CORE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function drawMoon(ctx, x, y) {
  const { CORE_COLOR, HALO_COLOR, CORE_RADIUS, HALO_RADIUS } = CANVAS_CONFIG.CELESTIAL.MOON;
  ctx.fillStyle = HALO_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, HALO_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = CORE_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, CORE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSky(ctx, w, h, hour) {
  const day = isDaytime(hour);
  drawSkyGradient(ctx, w, h, skyBandFor(hour).stops);
  if (isNightSky(hour)) drawStars(ctx, w, h);

  const { X_START, X_SPAN, Y_BASE, Y_HEIGHT } = CANVAS_CONFIG.CELESTIAL;
  const { DAY_START_HOUR, DAY_END_HOUR } = CANVAS_CONFIG.SKY;
  // Progress along the arc: 0 at rise, 1 at set. Sun and moon share the same path.
  const p = day
    ? (hour - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)
    : ((hour - DAY_END_HOUR + 24) % 24) / (24 - (DAY_END_HOUR - DAY_START_HOUR));
  const x = w * (X_START + X_SPAN * p);
  const y = h * Y_BASE - Math.sin(Math.PI * p) * h * Y_HEIGHT;

  if (day) drawSun(ctx, x, y);
  else drawMoon(ctx, x, y);
}

export function drawGround(ctx, w, h, night) {
  const {
    TOP_RATIO,
    SOIL_COLOR,
    PEBBLE_COLOR,
    NIGHT_SOIL_COLOR,
    NIGHT_PEBBLE_COLOR,
    PEBBLE_COUNT,
  } = CANVAS_CONFIG.GROUND;
  const top = h * TOP_RATIO;
  ctx.fillStyle = night ? NIGHT_SOIL_COLOR : SOIL_COLOR;
  ctx.fillRect(0, top, w, h - top);

  const rand = mulberry32(3);
  ctx.fillStyle = night ? NIGHT_PEBBLE_COLOR : PEBBLE_COLOR;
  for (let i = 0; i < PEBBLE_COUNT; i++) {
    const x = rand() * w;
    const y = top + 5 + rand() * (h - top - 10);
    ctx.beginPath();
    ctx.ellipse(x, y, 3 + rand() * 3, 2 + rand() * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- Plant ----------

function branch(ctx, p) {
  const { x, y, angle, len, depth, wilt, stage, rand, timeMs, seed } = p;

  if (depth === 0 || len < 2) {
    tip(ctx, { x, y, stage, wilt, rand });
    return;
  }

  // Droop and sway apply to this segment's direction only. Children use the base angle,
  // so droop does not compound across levels.
  const side = Math.cos(angle) >= 0 ? 1 : -1;
  const sway = Math.sin(timeMs / 900 + seed + depth * 0.4) * 0.03 * (1 + wilt * 2);
  const a = angle + side * wilt * 0.8 + sway;

  const ex = x + Math.cos(a) * len;
  const ey = y + Math.sin(a) * len;

  ctx.strokeStyle = lerpColor('#3f7d3a', '#8a6a3a', wilt);
  ctx.lineWidth = Math.max(1, depth * 1.2);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const spread = 0.45 + rand() * 0.3;
  const shrink = 0.72 + rand() * 0.1;
  branch(ctx, { ...p, x: ex, y: ey, angle: angle - spread, len: len * shrink, depth: depth - 1 });
  branch(ctx, { ...p, x: ex, y: ey, angle: angle + spread, len: len * shrink, depth: depth - 1 });
}

function tip(ctx, { x, y, stage, wilt, rand }) {
  const isBloom = stage >= 3 && rand() < 0.3;
  const fresh = isBloom ? '#e86fa0' : '#5fae52';
  ctx.fillStyle = lerpColor(fresh, '#9b7b4a', wilt);
  ctx.beginPath();
  ctx.ellipse(x, y, 5, 3, rand() * Math.PI, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlant(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.baseY);
  ctx.scale(o.scale, o.scale);

  if (o.stage === 0) {
    // Glow + soil mound so a fresh seed is findable against the dark ground.
    const glow = ctx.createRadialGradient(0, -8, 2, 0, -8, 36);
    glow.addColorStop(0, `rgba(193, 239, 180, ${0.5 * (1 - o.wilt)})`);
    glow.addColorStop(1, 'rgba(193, 239, 180, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -8, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lerpColor('#6b4423', '#4a3220', o.wilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 8, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = lerpColor('#d19a4f', '#7a5a35', o.wilt);
    ctx.beginPath();
    ctx.ellipse(0, -9, 9, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    branch(ctx, {
      x: 0,
      y: 0,
      angle: -Math.PI / 2,
      len: TRUNK_LEN,
      depth: DEPTH_BY_STAGE[o.stage],
      wilt: o.wilt,
      stage: o.stage,
      rand: mulberry32(o.seed),
      timeMs: o.timeMs,
      seed: o.seed,
    });
  }
  ctx.restore();
}

// Draws sky, sun/moon, ground, and the whole garden in one row.
// hour: local time as a float (e.g. 14.5 = 2:30 PM). The active plant (last) gets the growth pop.
export function drawScene(ctx, { width, height, plants, wilts, popScale, timeMs, hour }) {
  const night = isNightSky(hour);
  drawSky(ctx, width, height, hour);
  drawGround(ctx, width, height, night);

  const n = plants.length;
  const slot = width / n;
  const baseScale = Math.min(1, slot / 200);
  const baseY = height * CANVAS_CONFIG.GROUND.TOP_RATIO;

  plants.forEach((plant, i) => {
    const isActive = i === n - 1;
    drawPlant(ctx, {
      x: slot * (i + 0.5),
      baseY,
      scale: baseScale * (isActive ? popScale : 1),
      stage: plant.stage,
      wilt: wilts[i] ?? 0,
      seed: 7 + i * 13,
      timeMs,
    });
  });
}
