import { LANDING_CONFIG } from './config';
import { drawSky as drawSharedSky, drawGround as drawSharedGround, isNightSky } from './canvas/drawPlant';

const {
  STAGE_NAMES,
  TIMELAPSE_PHASES,
  BUTTON_LABELS,
  TOOLTIPS,
  CIRCADIAN_STUDIOS,
  SESSION_STATUS,
  TAXONOMIC_BEDS,
  DIAL_DESCRIPTIONS,
  SUN_LABELS,
  MOISTURE_LEVELS,
  TELEMETRY,
} = LANDING_CONFIG;

function initLandingShowcase() {
  let currentStage = 0;
  let isWilted = false;
  let bloomsCount = 0;
  let activeMinutes = 25;
  let totalSeconds = 25 * 60;
  let currentSeconds = 25 * 60;
  let workDoneCount = 0;
  let timerInterval = null;
  let isTimerRunning = false;
  const RING_R = 110;
  const RING_C = 2 * Math.PI * RING_R; // ~691.15

  let isTimelapseRunning = false;
  let timelapseProgress = 0.0;
  let timelapseSpeed = 15;
  let isMultiGarden = false;
  let lastFrameTime = performance.now();

  const petals = Array.from({ length: 9 }, () => ({
    x: Math.random() * 450,
    y: Math.random() * 260,
    size: 2.5 + Math.random() * 2.5,
    speedX: 0.35 + Math.random() * 0.45,
    speedY: 0.45 + Math.random() * 0.65,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: 0.01 + Math.random() * 0.02,
  }));

  const timerDisplay = document.getElementById('timer-display-val');
  const timerBtn = document.getElementById('toggle-timer-btn');
  const timerBtnText = document.getElementById('timer-btn-text');
  const resetBtn = document.getElementById('reset-timer-btn');
  const timerStroke = document.getElementById('timer-stroke');
  const timerStageDesc = document.getElementById('timer-stage-desc');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const stepperDec = document.getElementById('stepper-dec');
  const stepperInc = document.getElementById('stepper-inc');
  const stepperVal = document.getElementById('stepper-val');
  const stageNavButtons = document.querySelectorAll('.stage-nav-btn');
  const overlayStage = document.getElementById('showcase-overlay-stage');
  const statStage = document.getElementById('showcase-stat-stage');
  const statBlooms = document.getElementById('showcase-stat-blooms');
  const statHours = document.getElementById('showcase-stat-hours');
  const statStreak = document.getElementById('showcase-stat-streak');
  const sessionDot = document.getElementById('showcase-session-dot');
  const sessionText = document.getElementById('showcase-session-text');
  const clockText = document.getElementById('showcase-clock');
  const circadianIcon = document.getElementById('showcase-circadian-icon');
  const sunIcon = document.getElementById('showcase-sun-icon');
  const sunLabel = document.getElementById('showcase-sun-label');
  const moistureVal = document.getElementById('showcase-moisture-val');
  const taxonomicDot = document.getElementById('showcase-taxonomic-dot');
  const taxonomicBadge = document.getElementById('showcase-taxonomic-badge');
  const heroDisplayPill = document.getElementById('hero-display-pill');
  const heroTimelapseBtn = document.getElementById('hero-timelapse-btn');
  const canvas = document.getElementById('showcase-canvas');

  const primaryTimelapseBtn = document.getElementById('primary-timelapse-btn');
  const timelapseBtnIcon = document.getElementById('timelapse-btn-icon');
  const timelapseBtnText = document.getElementById('timelapse-btn-text');
  const canvasTimelapseBtn = document.getElementById('canvas-timelapse-btn');
  const canvasTimelapseLabel = document.getElementById('canvas-timelapse-label');
  const timelapseScrubber = document.getElementById('timelapse-scrubber');
  const timelapsePercent = document.getElementById('timelapse-percent');
  const timelapsePhaseText = document.getElementById('timelapse-phase-text');
  const speedButtons = document.querySelectorAll('.timelapse-speed-btn');
  const toggleWiltBtn = document.getElementById('toggle-wilt-preview-btn');
  const wiltBtnText = document.getElementById('wilt-btn-text');

  const SUN_SVG = `<svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const MOON_SVG = `<svg class="w-3.5 h-3.5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getSimulatedTime(hFloat) {
    const totalMinutes = Math.floor(hFloat * 60);
    const h24 = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const h12 = h24 % 12 || 12;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    let studioStr;
    if (h24 >= 5 && h24 < 8) studioStr = CIRCADIAN_STUDIOS.MORNING_DAWN;
    else if (h24 >= 8 && h24 < 17) studioStr = CIRCADIAN_STUDIOS.DAYLIGHT_STUDIO;
    else if (h24 >= 17 && h24 < 20) studioStr = CIRCADIAN_STUDIOS.GOLDEN_HOUR;
    else studioStr = CIRCADIAN_STUDIOS.NIGHT_SANCTUARY;
    return { timeStr, studioStr, isDay: h24 >= 6 && h24 < 18, hour: h24 };
  }

  function syncUI() {
    let simHour = new Date().getHours();
    let isDay = simHour >= 6 && simHour < 18;
    let timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    let studioStr = isDay ? CIRCADIAN_STUDIOS.DAYLIGHT_STUDIO : CIRCADIAN_STUDIOS.EVENING_STUDIO;

    if (isTimelapseRunning || timelapseProgress > 0) {
      const hFloat = 6 + timelapseProgress * 16;
      const sim = getSimulatedTime(hFloat);
      isDay = sim.isDay;
      timeStr = sim.timeStr;
      studioStr = sim.studioStr;
    }

    if (clockText) clockText.textContent = `${timeStr} · ${studioStr}`;
    if (circadianIcon) circadianIcon.innerHTML = isDay ? SUN_SVG : MOON_SVG;
    if (sunIcon) sunIcon.innerHTML = isDay ? SUN_SVG : MOON_SVG;
    if (sunLabel) {
      sunLabel.textContent = isDay
        ? studioStr === CIRCADIAN_STUDIOS.GOLDEN_HOUR
          ? SUN_LABELS.GOLDEN_SUN
          : SUN_LABELS.FILTERED_SUN
        : SUN_LABELS.MOONLIGHT_REST;
    }

    if (moistureVal) moistureVal.textContent = isWilted ? MOISTURE_LEVELS.WILTED : MOISTURE_LEVELS.HEALTHY;
    if (taxonomicDot) taxonomicDot.className = `w-1.5 h-1.5 rounded-full ${isWilted ? 'bg-error' : 'bg-primary'}`;
    if (taxonomicBadge) {
      taxonomicBadge.textContent = isWilted
        ? TAXONOMIC_BEDS.WILTED
        : isMultiGarden
          ? TAXONOMIC_BEDS.SANCTUARY_GROVE
          : TAXONOMIC_BEDS.NURSERY_BED;
    }

    if (heroDisplayPill) {
      heroDisplayPill.textContent = isTimelapseRunning
        ? TELEMETRY.formatHeroPillTimelapse(Math.round(timelapseProgress * 100))
        : TELEMETRY.formatHeroPillStandard(formatTime(currentSeconds), STAGE_NAMES[currentStage]);
    }

    if (timerDisplay) timerDisplay.textContent = formatTime(currentSeconds);
    if (timerStageDesc) {
      timerStageDesc.textContent = isMultiGarden
        ? DIAL_DESCRIPTIONS.FLOURISHING_GROVE
        : DIAL_DESCRIPTIONS.formatNurturing(STAGE_NAMES[currentStage]);
    }
    if (timerStroke) {
      const progress = totalSeconds > 0 ? (totalSeconds - currentSeconds) / totalSeconds : 0;
      timerStroke.style.strokeDashoffset = RING_C * (1 - progress);
    }

    if (overlayStage) overlayStage.textContent = STAGE_NAMES[currentStage];
    if (statStage) {
      statStage.textContent = `${STAGE_NAMES[currentStage]}${isWilted ? TELEMETRY.WILTED_SUFFIX : ''}`;
      statStage.className = `font-serif text-base sm:text-lg ${isWilted ? 'text-error' : 'text-primary'} font-medium`;
    }
    if (statBlooms) statBlooms.textContent = bloomsCount.toString();
    if (statHours) {
      const hrs = ((workDoneCount * activeMinutes) / 60).toFixed(1);
      statHours.innerHTML = `${hrs} <span class="text-[11px] font-sans text-on-surface-variant font-normal">${TELEMETRY.HOURS_UNIT}</span>`;
    }
    if (statStreak) {
      statStreak.innerHTML = `${Math.max(0, workDoneCount)} <span class="text-[11px] font-sans text-on-surface-variant font-normal">${TELEMETRY.DAYS_UNIT}</span>`;
    }

    if (sessionDot && sessionText) {
      if (isTimelapseRunning) {
        sessionDot.className = 'w-1.5 h-1.5 rounded-full bg-primary animate-pulse';
        sessionText.textContent = SESSION_STATUS.formatTimelapseActive(timelapseSpeed);
      } else if (isTimerRunning) {
        sessionDot.className = 'w-1.5 h-1.5 rounded-full bg-primary animate-ping';
        sessionText.textContent = SESSION_STATUS.ACTIVE_FOCUS;
      } else {
        sessionDot.className = 'w-1.5 h-1.5 rounded-full bg-primary';
        sessionText.textContent = SESSION_STATUS.SAMPLE_SIMULATOR;
      }
    }

    stageNavButtons.forEach((btn, i) => {
      const dot = btn.querySelector('span:first-child');
      const label = btn.querySelector('span:last-child');
      const isSelected = i === currentStage;

      if (isSelected) {
        btn.className = `stage-nav-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isWilted ? 'bg-error-container text-error border border-error/50' : 'bg-secondary-container text-on-secondary-fixed-variant'} transition-all cursor-pointer`;
        if (dot) dot.className = `w-1.5 h-1.5 rounded-full ${isWilted ? 'bg-error' : 'bg-primary'}`;
        if (label) label.textContent = TELEMETRY.formatStageBadge(i, STAGE_NAMES[i], true);
      } else {
        btn.className = 'stage-nav-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-on-surface-variant/70 hover:text-on-surface transition-all cursor-pointer';
        if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-outline-variant';
        if (label) label.textContent = TELEMETRY.formatStageBadge(i, STAGE_NAMES[i], false);
      }
    });

    if (timelapseScrubber) timelapseScrubber.value = Math.round(timelapseProgress * 100);
    if (timelapsePercent) timelapsePercent.textContent = `${Math.round(timelapseProgress * 100)}%`;
    if (timelapsePhaseText) {
      const progressPercent = Math.round(timelapseProgress * 100);
      if (isWilted) {
        timelapsePhaseText.textContent = TIMELAPSE_PHASES.WILTED;
      } else if (progressPercent < 20) {
        timelapsePhaseText.textContent = TIMELAPSE_PHASES.PHASE_1;
      } else if (progressPercent < 50) {
        timelapsePhaseText.textContent = TIMELAPSE_PHASES.PHASE_2;
      } else if (progressPercent < 80) {
        timelapsePhaseText.textContent = TIMELAPSE_PHASES.PHASE_3;
      } else if (progressPercent < 95) {
        timelapsePhaseText.textContent = TIMELAPSE_PHASES.PHASE_4;
      } else {
        timelapsePhaseText.textContent = TIMELAPSE_PHASES.PHASE_5;
      }
    }

    if (stepperVal) stepperVal.textContent = `${activeMinutes}${TELEMETRY.MINUTES_SUFFIX}`;
    presetButtons.forEach((presetBtn) => {
      const presetMinutes = parseInt(presetBtn.getAttribute('data-time'), 10);
      if (presetMinutes === activeMinutes) {
        presetBtn.className =
          'flex-1 py-1.5 text-center rounded-full border text-xs transition-all cursor-pointer preset-btn border-primary bg-secondary-container text-on-secondary-fixed-variant font-semibold shadow-xs';
      } else {
        presetBtn.className =
          'flex-1 py-1.5 text-center rounded-full border text-xs transition-all cursor-pointer preset-btn border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium';
      }
    });

    if (primaryTimelapseBtn) {
      if (isTimelapseRunning) {
        primaryTimelapseBtn.className =
          'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-tertiary hover:bg-tertiary-container text-on-tertiary shadow-xs transition-all cursor-pointer active:scale-95 animate-pulse';
        if (timelapseBtnIcon) timelapseBtnIcon.textContent = 'pause';
        if (timelapseBtnText) timelapseBtnText.textContent = BUTTON_LABELS.PAUSE_TIMELAPSE;
      } else {
        primaryTimelapseBtn.className =
          'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary hover:bg-surface-tint text-on-primary shadow-xs transition-all cursor-pointer active:scale-95';
        if (timelapseBtnIcon) timelapseBtnIcon.textContent = 'fast_forward';
        if (timelapseBtnText) {
          timelapseBtnText.textContent =
            timelapseProgress >= 1.0 ? BUTTON_LABELS.REPLAY_TIMELAPSE : BUTTON_LABELS.PLAY_TIMELAPSE;
        }
      }
    }
    if (canvasTimelapseLabel) {
      canvasTimelapseLabel.textContent = isTimelapseRunning ? BUTTON_LABELS.CANVAS_PAUSE : BUTTON_LABELS.CANVAS_TIMELAPSE;
    }

    if (toggleWiltBtn) {
      toggleWiltBtn.disabled = isTimelapseRunning;
      if (isTimelapseRunning) {
        toggleWiltBtn.className =
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-on-surface-variant/40 bg-surface-container/50 border border-outline-variant/30 font-medium transition-all cursor-not-allowed opacity-50';
        toggleWiltBtn.title = TOOLTIPS.WILT_DISABLED;
        if (wiltBtnText) wiltBtnText.textContent = BUTTON_LABELS.TEST_WILT;
      } else if (isWilted) {
        toggleWiltBtn.className =
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-error bg-error-container/40 hover:bg-error-container/60 border border-error/50 font-medium transition-all cursor-pointer';
        toggleWiltBtn.title = TOOLTIPS.HEAL_WILT;
        if (wiltBtnText) wiltBtnText.textContent = BUTTON_LABELS.HEAL_WILT;
      } else {
        toggleWiltBtn.className =
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-tertiary bg-tertiary-fixed/30 hover:bg-tertiary-fixed/50 border border-tertiary-fixed/60 font-medium transition-all cursor-pointer';
        toggleWiltBtn.title = TOOLTIPS.TEST_WILT;
        if (wiltBtnText) wiltBtnText.textContent = BUTTON_LABELS.TEST_WILT;
      }
    }
  }

  function applyProgress(progressFraction) {
    timelapseProgress = Math.max(0, Math.min(1.0, progressFraction));

    if (timelapseProgress < 0.2) {
      currentStage = 0;
      isMultiGarden = false;
    } else if (timelapseProgress < 0.5) {
      currentStage = 1;
      isMultiGarden = false;
    } else if (timelapseProgress < 0.8) {
      currentStage = 2;
      isMultiGarden = false;
    } else if (timelapseProgress < 0.95) {
      currentStage = 3;
      isMultiGarden = false;
    } else {
      currentStage = 4;
      isMultiGarden = true;
    }

    const cycleFraction = (timelapseProgress * 5) % 1;
    currentSeconds = Math.max(0, Math.round((1 - cycleFraction) * activeMinutes * 60));
    totalSeconds = activeMinutes * 60;

    bloomsCount = Math.floor(timelapseProgress * 3);
    workDoneCount = Math.floor(timelapseProgress * 5);

    syncUI();
  }

  function startTimelapse() {
    if (isTimelapseRunning) return;
    if (timelapseProgress >= 1.0) {
      timelapseProgress = 0.0;
    }
    isWilted = false;
    isTimelapseRunning = true;
    isTimerRunning = false;
    clearInterval(timerInterval);
    lastFrameTime = performance.now();
    syncUI();
  }

  function pauseTimelapse() {
    isTimelapseRunning = false;
    syncUI();
  }

  function toggleTimelapse() {
    if (isTimelapseRunning) {
      pauseTimelapse();
    } else {
      startTimelapse();
    }
  }

  if (primaryTimelapseBtn) primaryTimelapseBtn.addEventListener('click', toggleTimelapse);
  if (canvasTimelapseBtn) canvasTimelapseBtn.addEventListener('click', toggleTimelapse);

  if (timelapseScrubber) {
    timelapseScrubber.addEventListener('input', (event) => {
      pauseTimelapse();
      applyProgress(parseFloat(event.target.value) / 100);
    });
  }

  speedButtons.forEach((speedBtn) => {
    speedBtn.addEventListener('click', () => {
      speedButtons.forEach((otherSpeedBtn) => {
        otherSpeedBtn.className =
          'timelapse-speed-btn px-2 py-0.5 rounded text-[10px] font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer';
      });
      speedBtn.className =
        'timelapse-speed-btn px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary-container text-on-secondary-fixed-variant transition-colors cursor-pointer';
      timelapseSpeed = parseInt(speedBtn.getAttribute('data-speed'), 10) || 15;
      syncUI();
    });
  });

  if (toggleWiltBtn) {
    toggleWiltBtn.addEventListener('click', () => {
      if (isTimelapseRunning) return;
      isWilted = !isWilted;
      syncUI();
    });
  }

  if (heroTimelapseBtn) {
    heroTimelapseBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (!isTimelapseRunning) startTimelapse();
      }, 400);
    });
  }

  function resetToSeedRest() {
    pauseTimer();
    pauseTimelapse();
    isWilted = false;
    applyProgress(0.0);
    currentSeconds = activeMinutes * 60;
    totalSeconds = activeMinutes * 60;
    if (timerBtnText) timerBtnText.textContent = BUTTON_LABELS.START_FOCUS;
    syncUI();
  }

  stageNavButtons.forEach((stageBtn, stageIndex) => {
    stageBtn.addEventListener('click', () => {
      pauseTimer();
      pauseTimelapse();
      isWilted = false;
      if (timerBtnText) timerBtnText.textContent = BUTTON_LABELS.START_FOCUS;
      if (stageIndex === 0) {
        resetToSeedRest();
      } else if (stageIndex === 1) {
        applyProgress(0.25);
      } else if (stageIndex === 2) {
        applyProgress(0.55);
      } else if (stageIndex === 3) {
        applyProgress(0.85);
      } else if (stageIndex === 4) {
        applyProgress(1.0);
      }
    });
  });

  function applyMinutes(mins) {
    activeMinutes = mins;
    pauseTimer();
    pauseTimelapse();
    totalSeconds = mins * 60;
    currentSeconds = totalSeconds;
    if (timerBtnText) timerBtnText.textContent = BUTTON_LABELS.START_FOCUS;
    syncUI();
  }

  function startTimer() {
    if (isTimerRunning) return;
    pauseTimelapse();
    isTimerRunning = true;
    if (timerBtnText) timerBtnText.textContent = BUTTON_LABELS.PAUSE_FOCUS;

    timerInterval = setInterval(() => {
      if (currentSeconds > 0) {
        currentSeconds--;
        syncUI();
        const elapsed = totalSeconds - currentSeconds;
        const quarter = Math.max(1, totalSeconds / 4);
        const stageFromTime = Math.min(3, Math.floor(elapsed / quarter));
        if (stageFromTime !== currentStage && !isMultiGarden) {
          currentStage = stageFromTime;
          syncUI();
        }
      } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (timerBtnText) timerBtnText.textContent = BUTTON_LABELS.CYCLE_COMPLETE;
        bloomsCount++;
        workDoneCount++;
        currentStage = 3;
        syncUI();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    clearInterval(timerInterval);
    if (timerBtnText) timerBtnText.textContent = BUTTON_LABELS.RESUME_FOCUS;
    syncUI();
  }

  if (timerBtn) {
    timerBtn.addEventListener('click', () => {
      if (isTimerRunning) pauseTimer();
      else startTimer();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetToSeedRest);
  }

  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.getAttribute('data-time'), 10);
      applyMinutes(mins);
    });
  });

  if (stepperDec) {
    stepperDec.addEventListener('click', () => {
      applyMinutes(Math.max(5, activeMinutes - 5));
    });
  }

  if (stepperInc) {
    stepperInc.addEventListener('click', () => {
      applyMinutes(Math.min(90, activeMinutes + 5));
    });
  }

  if (canvas) {
    const ctx = canvas.getContext('2d');
    const DEPTH_BY_STAGE = [0, 2, 4, 5];
    const TRUNK_LEN = 75;

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

    // Sky, sun/moon arc, stars and ground come from the shared renderer so the landing sample
    // and the app can never drift apart.
    function drawSky(w, h, hour) {
      drawSharedSky(ctx, w, h, hour);
    }

    function drawGround(w, h, night) {
      drawSharedGround(ctx, w, h, night);
    }

    function tip(x, y, stage, rand, wilt) {
      const isBloom = stage >= 3 && rand() < 0.35;
      const fresh = isBloom ? '#e86fa0' : '#5fae52';
      ctx.fillStyle = wilt > 0.3 ? '#9b7b4a' : fresh;
      ctx.beginPath();
      ctx.ellipse(x, y, isBloom ? 6 : 5, isBloom ? 4 : 3, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    function branch(p) {
      const { x, y, angle, len, depth, stage, rand, timeMs, seed, wilt } = p;
      if (depth === 0 || len < 2) {
        tip(x, y, stage, rand, wilt);
        return;
      }

      const side = Math.cos(angle) >= 0 ? 1 : -1;
      const sway = Math.sin(timeMs / 900 + seed + depth * 0.4) * 0.03 * (1 + wilt * 2);
      const a = angle + side * wilt * 0.8 + sway;
      const ex = x + Math.cos(a) * len;
      const ey = y + Math.sin(a) * len;

      ctx.strokeStyle = wilt > 0.3 ? '#8a6a3a' : '#3f7d3a';
      ctx.lineWidth = Math.max(1, depth * 1.2);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      const spread = 0.45 + rand() * 0.3;
      const shrink = 0.72 + rand() * 0.1;
      branch({ ...p, x: ex, y: ey, angle: angle - spread, len: len * shrink, depth: depth - 1 });
      branch({ ...p, x: ex, y: ey, angle: angle + spread, len: len * shrink, depth: depth - 1 });
    }

    function drawSingleTree(x, baseY, stage, wilt, seed, timeMs, scale = 1.0) {
      ctx.save();
      ctx.translate(x, baseY);
      ctx.scale(scale, scale);
      if (stage === 0) {
        ctx.fillStyle = wilt > 0.3 ? '#5a3d1f' : '#8b5a2b';
        ctx.beginPath();
        ctx.ellipse(0, -4, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (wilt <= 0.3) {
          ctx.fillStyle = '#6ab85e';
          ctx.beginPath();
          ctx.arc(2, -6, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        branch({
          x: 0,
          y: 0,
          angle: -Math.PI / 2,
          len: TRUNK_LEN,
          depth: DEPTH_BY_STAGE[Math.min(3, stage)],
          stage: Math.min(3, stage),
          rand: mulberry32(seed),
          timeMs,
          seed,
          wilt,
        });
      }
      ctx.restore();
    }

    function resizeAndRender(now) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      if (isTimelapseRunning) {
        const delta = (now - lastFrameTime) / 1000;
        timelapseProgress += delta * (timelapseSpeed / 160);
        if (timelapseProgress >= 1.0) {
          timelapseProgress = 1.0;
          pauseTimelapse();
        }
        applyProgress(timelapseProgress);
      }
      lastFrameTime = now;

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      const clock = new Date();
      let currentHour = clock.getHours() + clock.getMinutes() / 60;
      if (isTimelapseRunning || timelapseProgress > 0) {
        currentHour = 6 + timelapseProgress * 16;
      }
      const night = isNightSky(currentHour);

      drawSky(w, h, currentHour);
      drawGround(w, h, night);

      if (isMultiGarden || currentStage === 4) {
        const specimens = [
          { stage: 3, wilt: 0, seed: 12, xRatio: 0.25, scale: 0.8 },
          { stage: Math.min(3, currentStage), wilt: isWilted ? 0.8 : 0, seed: 7, xRatio: 0.52, scale: 0.95 },
          { stage: Math.max(1, (currentStage || 1) - 1), wilt: 0, seed: 23, xRatio: 0.78, scale: 0.75 },
        ];
        specimens.forEach((sp) => {
          drawSingleTree(w * sp.xRatio, h * 0.9, sp.stage, sp.wilt, sp.seed, now, sp.scale);
        });
      } else {
        drawSingleTree(w * 0.5, h * 0.9, currentStage, isWilted ? 0.8 : 0, 7, now, 1.0);
      }

      if ((currentStage === 3 || isMultiGarden || currentStage === 4) && !isWilted) {
        ctx.fillStyle = 'rgba(232, 111, 160, 0.75)';
        petals.forEach((pt) => {
          pt.x += pt.speedX;
          pt.y += pt.speedY;
          pt.rotation += pt.rotSpeed;
          if (pt.y > h * 0.9) {
            pt.y = 10;
            pt.x = Math.random() * w;
          }
          if (pt.x > w) pt.x = 0;

          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rotation);
          ctx.beginPath();
          ctx.ellipse(0, 0, pt.size, pt.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      ctx.restore();
      requestAnimationFrame(resizeAndRender);
    }

    requestAnimationFrame(resizeAndRender);
  }

  syncUI();
}

function initScrollspy() {
  const desktopNav = document.getElementById('desktop-nav');
  const navIndicator = document.getElementById('nav-active-indicator');
  if (!desktopNav || !navIndicator) return;

  const navLinks = desktopNav.querySelectorAll('.nav-link');
  const sections = [
    { id: 'sanctuary', el: document.getElementById('sanctuary') },
    { id: 'pillars', el: document.getElementById('pillars') },
    { id: 'comparison', el: document.getElementById('comparison') },
    { id: 'showcase', el: document.getElementById('showcase') },
  ];

  let currentActiveId = 'sanctuary';
  let isManualClick = false;
  let clickTimeout = null;

  function updateIndicator(activeLink) {
    if (!activeLink) return;
    const navRect = desktopNav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    const width = linkRect.width;

    navIndicator.style.left = `${left}px`;
    navIndicator.style.width = `${width}px`;
    navIndicator.style.opacity = '1';
  }

  function setActive(id) {
    if (currentActiveId === id && navIndicator.style.opacity === '1') return;
    currentActiveId = id;

    let targetLink = null;
    navLinks.forEach((link) => {
      const section = link.getAttribute('data-section');
      if (section === id) {
        targetLink = link;
        link.className =
          'nav-link text-primary font-label-md text-label-md transition-colors duration-200 relative py-1 font-semibold';
      } else {
        link.className =
          'nav-link text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors duration-200 relative py-1 font-medium';
      }
    });

    if (targetLink) {
      updateIndicator(targetLink);
    }
  }

  function onScroll() {
    if (isManualClick) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollY + windowHeight >= docHeight - 80) {
      setActive('showcase');
      return;
    }

    const triggerOffset = 160;
    let activeId = 'sanctuary';

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.el) {
        const rect = section.el.getBoundingClientRect();
        if (rect.top <= triggerOffset) {
          activeId = section.id;
          break;
        }
      }
    }

    if (scrollY < 120) {
      activeId = 'sanctuary';
    }

    setActive(activeId);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('data-section');
      isManualClick = true;
      clearTimeout(clickTimeout);
      setActive(id);

      clickTimeout = setTimeout(() => {
        isManualClick = false;
        onScroll();
      }, 800);
    });
  });

  window.addEventListener('resize', () => {
    const activeLink = desktopNav.querySelector(`[data-section="${currentActiveId}"]`);
    if (activeLink) updateIndicator(activeLink);
  });

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );

  const initialLink = desktopNav.querySelector(`[data-section="sanctuary"]`);
  if (initialLink) {
    updateIndicator(initialLink);
  }
  setTimeout(onScroll, 60);
  window.addEventListener('load', onScroll);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLandingShowcase();
    initScrollspy();
  });
} else {
  initLandingShowcase();
  initScrollspy();
}
