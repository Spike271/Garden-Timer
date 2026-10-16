import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGarden } from './state/GardenContext';
import { clampFocus, useSettings } from './state/SettingsContext';
import { usePomodoro } from './hooks/usePomodoro';
import PlantCanvas from './components/PlantCanvas';
import { useWeather } from './hooks/useWeather';
import { PHASES } from './state/constants';
import { countBloomsOn, localDateKey } from './state/gardenLogic';
import { APP_STRINGS, WEATHER_CONFIG } from './config';

const {
  BRAND,
  CIRCADIAN,
  PHASES: PHASE_STRINGS,
  NOTIFICATIONS,
  CADENCE,
  SPECIMEN,
  STATS,
} = APP_STRINGS;

const LOGO_SRC = `${import.meta.env.BASE_URL}favicon.jpg`;

const PHASE_LABELS = PHASE_STRINGS.LABELS;
const STAGE_NAMES = SPECIMEN.STAGE_NAMES;

const RING_R = 110;
const RING_C = 2 * Math.PI * RING_R; // ~691.15

function formatTime(ms) {
  const total = Math.ceil(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function App() {
  const { plants, grow, wilt } = useGarden();
  const { presets, setFocusMinutes } = useSettings();
  const [toast, setToast] = useState(null);
  const [intention, setIntention] = useState(CADENCE.DEFAULT_INTENTION);
  const [timeString, setTimeString] = useState('');
  const [isDaylight, setIsDaylight] = useState(true);
  const weather = useWeather();

  // Circadian clock for header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsDaylight(hours >= 6 && hours < 18);
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30_000);
    return () => clearInterval(interval);
  }, []);

  const durations = useMemo(
    () => ({
      [PHASES.WORK]: presets.focusMinutes * 60_000,
      [PHASES.SHORT_BREAK]: presets.shortBreakMinutes * 60_000,
      [PHASES.LONG_BREAK]: presets.longBreakMinutes * 60_000,
    }),
    [presets],
  );

  const notify = useCallback((text, type = 'success') => {
    setToast({ text, type, id: Date.now() });
  }, []);

  const { phase, workDone, running, remainingMs, progress, start, skip } = usePomodoro({
    durations,
    onWorkComplete: () => {
      grow();
      notify(NOTIFICATIONS.WORK_COMPLETE, 'success');
    },
    onWorkSkip: () => {
      wilt();
      notify(NOTIFICATIONS.WORK_SKIPPED, 'warning');
    },
  });

  useEffect(() => {
    document.body.dataset.phase = phase;
  }, [phase]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const active = plants[plants.length - 1];
  const blooms = countBloomsOn(plants, localDateKey());
  const sessionInCycle = (workDone % 4) + 1;

  const handlePresetClick = (mins) => {
    setFocusMinutes(mins);
  };

  const handleStep = (delta) => {
    const nextVal = clampFocus(presets.focusMinutes + delta);
    setFocusMinutes(nextVal);
  };

  return (
    <div className="min-h-screen flex flex-col herbal-base text-on-surface antialiased">
      {/* TOP STUDIO NAVIGATION BAR */}
      <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant/40 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline-variant/50 shadow-xs">
                <img src={LOGO_SRC} alt={BRAND.LOGO_ALT} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl text-primary tracking-tight font-medium flex items-center gap-1.5">
                  {BRAND.NAME}
                </span>
                <p className="text-xs text-on-surface-variant font-medium m-0">{BRAND.TAGLINE}</p>
              </div>
            </div>
          </div>

          {/* Circadian Studio Indicator (Center) */}
          <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/40 shadow-xs">
            {isDaylight ? (
              <svg
                className="w-4 h-4 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-secondary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            <span className="text-xs font-semibold text-on-surface tracking-wide">
              {isDaylight ? CIRCADIAN.DAYLIGHT_STUDIO : CIRCADIAN.EVENING_STUDIO} ·{' '}
              {timeString || CIRCADIAN.DEFAULT_TIME}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span
              className="text-xs text-on-surface-variant transition-opacity duration-300"
              title={WEATHER_CONFIG.LOCATION.formatTooltip(weather.location)}
            >
              {weather.text}
            </span>
          </div>

          {/* Session State Badge & Return CTA */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-xs font-semibold text-on-secondary-fixed-variant">
              <span
                className={`w-2 h-2 rounded-full ${
                  phase === PHASES.WORK
                    ? running
                      ? 'bg-primary animate-pulse'
                      : 'bg-primary'
                    : 'bg-secondary'
                }`}
              ></span>
              <span>
                {running
                  ? PHASE_STRINGS.formatPhaseActive(PHASE_LABELS[phase])
                  : PHASE_STRINGS.formatPhaseReady(PHASE_LABELS[phase])}
              </span>
            </div>

            <a
              href="index.html"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors border border-outline-variant/40"
              title={BRAND.RETURN_CTA_TITLE}
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{BRAND.RETURN_CTA}</span>
            </a>
          </div>
        </div>
      </header>

      {/* INTERACTIVE NOTIFICATION TOAST */}
      {toast && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 w-full toast-botanical">
          <output
            className={`flex items-center justify-between px-5 py-3 rounded-xl border shadow-sm transition-all duration-300 ${
              toast.type === 'warning'
                ? 'bg-error-container/80 border-error/30 text-on-error-container'
                : 'bg-surface-container-low border-outline-variant/60 text-on-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  toast.type === 'warning' ? 'text-error' : 'text-primary'
                }`}
              >
                {toast.type === 'warning' ? 'energy_savings_leaf' : 'potted_plant'}
              </span>
              <p className="text-sm font-normal m-0">
                <strong
                  className={`text-xs uppercase mr-2 tracking-wider font-semibold ${
                    toast.type === 'warning' ? 'text-error' : 'text-primary'
                  }`}
                >
                  {toast.type === 'warning'
                    ? NOTIFICATIONS.BADGE_INTERRUPTION
                    : NOTIFICATIONS.BADGE_GROWTH}
                </strong>
                {toast.text}
              </p>
            </div>
            <button
              type="button"
              aria-label={NOTIFICATIONS.DISMISS_ARIA}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full transition-colors bg-transparent border-0 cursor-pointer"
              onClick={() => setToast(null)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </output>
        </div>
      )}

      {/* MAIN COHESIVE WINDOW WORKSPACE */}
      <main className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        <div className="pressed-paper-card border border-outline-variant/60 rounded-2xl overflow-hidden shadow-md">
          {/* WINDOW TITLEBAR */}
          <div className="bg-surface-container px-4 sm:px-6 py-3.5 border-b border-outline-variant/50 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Left: Window Controls & Circadian Clock */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 opacity-60">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
              </div>
              <div className="h-3.5 w-px bg-outline-variant/50"></div>
              <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                {isDaylight ? (
                  <svg
                    className="w-3.5 h-3.5 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-secondary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                <span>
                  {timeString || CIRCADIAN.DEFAULT_TIME} ·{' '}
                  {isDaylight ? CIRCADIAN.DAYLIGHT_STUDIO : CIRCADIAN.EVENING_STUDIO}
                </span>
              </div>
            </div>

            {/* Right: Active Session Telemetry */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-[11px] font-semibold">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-primary animate-pulse' : 'bg-primary'}`}
                ></span>
                <span>
                  {running
                    ? PHASE_STRINGS.formatPhaseActive(PHASE_LABELS[phase])
                    : PHASE_STRINGS.formatPhaseReady(PHASE_LABELS[phase])}
                </span>
              </span>
            </div>
          </div>

          {/* FULL-WIDTH BOTANICAL PROGRESSION CYCLE RIBBON */}
          <div className="bg-surface border-b border-outline-variant/40 px-4 sm:px-6 py-3 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[580px] gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant/80 font-medium">
                  {SPECIMEN.PROGRESSION_TITLE}
                </span>
                {STAGE_NAMES.map((name, idx) => {
                  const isCurrent = active.stage === idx;
                  const isPast = active.stage > idx;
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-xs ${
                          isCurrent
                            ? active.wilted
                              ? 'bg-error-container/70 border border-error text-error font-semibold'
                              : 'bg-secondary-container text-on-secondary-fixed-variant font-semibold'
                            : isPast
                              ? 'bg-surface-container-low border border-outline-variant/40 text-secondary'
                              : 'text-on-surface-variant/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCurrent
                              ? active.wilted
                                ? 'bg-error'
                                : 'bg-primary'
                              : isPast
                                ? 'bg-secondary'
                                : 'bg-outline-variant'
                          }`}
                        ></span>
                        <span>{SPECIMEN.formatStageLabel(idx, name, isCurrent)}</span>
                      </span>
                      {idx < STAGE_NAMES.length - 1 && (
                        <svg
                          className="w-3.5 h-3.5 text-outline-variant"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Interruption / Wilt Warning Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] ${
                  active.wilted
                    ? 'bg-error-container text-error border border-error/40 font-medium'
                    : 'text-tertiary bg-tertiary-fixed/30 border border-tertiary-fixed font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {active.wilted ? 'warning' : 'energy_savings_leaf'}
                </span>
                <span>{active.wilted ? SPECIMEN.WILTED_WARNING : SPECIMEN.WILT_WARNING}</span>
              </div>
            </div>
          </div>

          {/* DUAL PANE WORKSPACE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* LEFT PANE: FOCUS CADENCE CONSOLE (5 COLS) */}
            <section className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant/40 bg-surface">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      schedule
                    </span>
                    <span className="text-xs font-semibold text-on-surface tracking-wider uppercase">
                      {CADENCE.TITLE}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary bg-surface-container px-2.5 py-0.5 rounded-full border border-outline-variant/30">
                    {PHASE_STRINGS.formatSessionProgress(sessionInCycle)}
                  </span>
                </div>

                {/* Quick Cadence Presets & Duration Stepper */}
                <div className="flex items-center gap-2 mb-6">
                  {CADENCE.PRESET_MINUTES.map((mins) => {
                    const isSelected = presets.focusMinutes === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handlePresetClick(mins)}
                        className={`flex-1 py-1.5 text-center rounded-full border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-secondary-container text-on-secondary-fixed-variant font-semibold shadow-xs'
                            : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium'
                        }`}
                      >
                        {CADENCE.formatPresetLabel(mins)}
                      </button>
                    );
                  })}

                  {/* Stepper controls */}
                  <div className="flex items-center justify-between px-2 py-0.5 rounded-full border border-outline-variant/60 bg-surface-container-low">
                    <button
                      type="button"
                      aria-label={CADENCE.DECREASE_MINUTES_ARIA}
                      onClick={() => handleStep(-5)}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1 bg-transparent border-0 cursor-pointer flex items-center justify-center rounded"
                    >
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                    <span className="text-[11px] font-semibold text-on-surface tabular-nums px-1">
                      {CADENCE.formatStepperLabel(presets.focusMinutes)}
                    </span>
                    <button
                      type="button"
                      aria-label={CADENCE.INCREASE_MINUTES_ARIA}
                      onClick={() => handleStep(5)}
                      className="text-on-surface-variant hover:text-primary transition-colors p-1 bg-transparent border-0 cursor-pointer flex items-center justify-center rounded"
                    >
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Circular Radial Dial */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto my-3 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 260 260"
                    aria-hidden="true"
                  >
                    <circle
                      cx="130"
                      cy="130"
                      r={RING_R}
                      fill="transparent"
                      stroke="#dce5db"
                      strokeWidth="8"
                    />
                    <circle
                      className="dial-circle-progress"
                      cx="130"
                      cy="130"
                      r={RING_R}
                      fill="transparent"
                      stroke={phase === PHASES.WORK ? '#376430' : '#903E5B'}
                      strokeWidth="8"
                      strokeDasharray={RING_C}
                      strokeDashoffset={RING_C * (1 - progress)}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-secondary font-semibold mb-0.5">
                      {PHASE_LABELS[phase]}
                    </span>
                    <div className="font-serif text-5xl sm:text-6xl text-on-surface font-light tracking-tight leading-none my-1 font-variant-numeric tabular-nums">
                      {formatTime(remainingMs)}
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium mt-1">
                      {phase === PHASES.WORK
                        ? SPECIMEN.formatNurturing(STAGE_NAMES[active.stage])
                        : SPECIMEN.RESTORATIVE_PAUSE}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls & Intention */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  {!running ? (
                    <button
                      type="button"
                      onClick={start}
                      className="flex-1 bg-primary hover:bg-surface-tint text-on-primary font-semibold text-xs py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                      <span>{PHASE_STRINGS.formatStartAction(PHASE_LABELS[phase])}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={skip}
                      className="flex-1 py-3 px-6 rounded-lg border border-tertiary-container/60 hover:bg-tertiary-fixed/40 text-tertiary text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                      title={
                        phase === PHASES.WORK
                          ? PHASE_STRINGS.FORFEIT_CYCLE_TOOLTIP
                          : PHASE_STRINGS.SKIP_BREAK_TOOLTIP
                      }
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>
                        {phase === PHASES.WORK
                          ? PHASE_STRINGS.FORFEIT_CYCLE
                          : PHASE_STRINGS.SKIP_BREAK}
                      </span>
                    </button>
                  )}
                </div>

                {/* Mindful Intention Text Prompt Box */}
                <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      edit_note
                    </span>
                    <label
                      htmlFor="intentionInput"
                      className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant"
                    >
                      {CADENCE.INTENTION_LABEL}
                    </label>
                  </div>
                  <input
                    id="intentionInput"
                    type="text"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder={CADENCE.INTENTION_PLACEHOLDER}
                    className="w-full bg-transparent border-0 border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-on-surface text-xs px-0 py-0.5 placeholder:text-outline-variant outline-none"
                  />
                </div>
              </div>
            </section>

            {/* RIGHT PANE: BOTANICAL TERRARIUM & NURSERY CANVAS (7 COLS) */}
            <section className="lg:col-span-7 bg-surface-container-low p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
              {/* Specimen Header & Telemetry */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-primary tracking-widest uppercase">
                      {SPECIMEN.formatNumber(plants.length)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="text-[10px] font-medium text-on-surface-variant">
                      {SPECIMEN.formatGarden(plants.length)}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-on-surface mt-0.5 mb-0 font-normal">
                    {SPECIMEN.TREE_NAME}
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/40 self-start sm:self-auto text-xs">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 text-primary"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M6.05 8.05c-2.73 2.73-2.73 7.15-.02 9.88 1.47-3.4 4.09-6.24 7.36-7.93-2.77 2.34-4.71 5.61-5.39 9.32 2.6 1.23 5.8.78 7.95-1.37C19.43 14.47 20 4 20 4S9.53 3.43 6.05 8.05z" />
                    </svg>
                    <span className="font-semibold text-on-surface">
                      {active.wilted
                        ? SPECIMEN.GROWTH_WILTED
                        : SPECIMEN.formatGrowth(active.stage, STAGE_NAMES.length)}
                    </span>
                  </div>
                  <span className="w-px h-3.5 bg-outline-variant/60"></span>
                  <div className="flex items-center gap-1.5">
                    {isDaylight ? (
                      <svg
                        className="w-3.5 h-3.5 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 text-secondary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    )}
                    <span className="font-semibold text-on-surface">
                      {isDaylight ? CIRCADIAN.FILTERED_SUN : CIRCADIAN.NIGHT_REST}
                    </span>
                  </div>
                </div>
              </div>

              {/* Central Procedural Living Canvas */}
              <div className="relative w-full rounded-xl overflow-hidden border border-outline-variant/50 shadow-inner my-4 select-none">
                <div className="w-full h-[280px] sm:h-[320px] relative">
                  <PlantCanvas />
                </div>
              </div>

              {/* Growth Telemetry Stats Footer Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-outline-variant/30 text-center">
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                    {STATS.STAGE_LABEL}
                  </span>
                  <span className="font-serif text-base sm:text-lg text-primary font-medium">
                    {STAGE_NAMES[active.stage]}
                    {active.wilted ? STATS.WILTED_SUFFIX : ''}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                    {STATS.BLOOMS_TODAY_LABEL}
                  </span>
                  <span className="font-serif text-base sm:text-lg text-on-surface font-medium">
                    {blooms}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                    {STATS.FOCUS_HOURS_LABEL}
                  </span>
                  <span className="font-serif text-base sm:text-lg text-on-surface font-medium">
                    {((workDone * presets.focusMinutes) / 60).toFixed(1)}{' '}
                    <span className="text-[11px] font-sans text-on-surface-variant font-normal">
                      {STATS.HOURS_UNIT}
                    </span>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-[10px] font-semibold text-on-surface-variant block uppercase tracking-wider">
                    {STATS.SESSIONS_LABEL}
                  </span>
                  <span className="font-serif text-base sm:text-lg text-secondary font-medium">
                    {workDone}{' '}
                    <span className="text-[11px] font-sans text-on-surface-variant font-normal">
                      {workDone === 1 ? STATS.SESSION_UNIT : STATS.SESSIONS_UNIT}
                    </span>
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface-container-low border-t border-outline-variant/40 mt-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <img
              src={LOGO_SRC}
              alt={BRAND.LOGO_ALT}
              className="w-5 h-5 rounded-md object-cover shadow-xs border border-outline-variant/50"
            />
            <span className="font-serif text-sm text-primary font-medium">{BRAND.NAME}</span>
            <span className="hidden sm:inline">{BRAND.FOOTER_TAGLINE}</span>
          </div>
          <p className="m-0">{BRAND.FOOTER_COPYRIGHT}</p>
        </div>
      </footer>
    </div>
  );
}
