import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGarden } from './state/GardenContext';
import { useSettings } from './state/SettingsContext';
import { usePomodoro } from './hooks/usePomodoro';
import { useClock } from './hooks/useClock';
import { useWeather } from './hooks/useWeather';
import PlantCanvas from './components/PlantCanvas';
import AppHeader from './components/AppHeader';
import Toast from './components/Toast';
import StageRibbon from './components/StageRibbon';
import CadenceControls from './components/CadenceControls';
import TimerDial from './components/TimerDial';
import SessionControls from './components/SessionControls';
import SpecimenHeader from './components/SpecimenHeader';
import StatsGrid from './components/StatsGrid';
import { PHASES, WORK_SESSIONS_PER_LONG_BREAK } from './state/constants';
import { countBloomsOn, localDateKey } from './state/gardenLogic';
import { APP_STRINGS } from './config';

const { BRAND, PHASES: PHASE_STRINGS, NOTIFICATIONS, CADENCE } = APP_STRINGS;

const LOGO_SRC = `${import.meta.env.BASE_URL}favicon.jpg`;

export default function App() {
  const { plants, grow, wilt } = useGarden();
  const { presets } = useSettings();
  const [toast, setToast] = useState(null);
  const [toastPaused, setToastPaused] = useState(false);
  const [intention, setIntention] = useState(CADENCE.DEFAULT_INTENTION);
  const { timeString, isDaylight } = useClock();
  const weather = useWeather();

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

  const { phase, workDone, focusMs, running, remainingMs, progress, start, skip } = usePomodoro({
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

  // Toast stays while hovered/focused, closes on Escape, otherwise after 8s.
  useEffect(() => {
    if (!toast || toastPaused) return;
    const id = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(id);
  }, [toast, toastPaused]);

  useEffect(() => {
    if (!toast) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setToast(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toast]);

  // Announced only when the phase or running state changes, never per tick.
  const statusText = `${PHASE_STRINGS.LABELS[phase]}: ${Math.round(durations[phase] / 60_000)} minutes, ${running ? 'running' : 'ready'}`;

  const active = plants[plants.length - 1];
  const blooms = countBloomsOn(plants, localDateKey());
  const sessionInCycle = (workDone % WORK_SESSIONS_PER_LONG_BREAK) + 1;

  return (
    <div className="min-h-screen flex flex-col herbal-base text-on-surface antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-lg"
      >
        {BRAND.SKIP_LINK}
      </a>
      <output className="sr-only">{statusText}</output>
      <AppHeader
        phase={phase}
        running={running}
        isDaylight={isDaylight}
        timeString={timeString}
        weather={weather}
      />

      <Toast
        toast={toast}
        onDismiss={() => setToast(null)}
        onPause={() => setToastPaused(true)}
        onResume={() => setToastPaused(false)}
      />

      <main
        id="main"
        tabIndex={-1}
        className="flex-grow outline-none max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full"
      >
        <h1 className="sr-only">{BRAND.NAME}</h1>
        <div className="pressed-paper-card border border-outline-variant/60 rounded-2xl overflow-hidden shadow-md">
          <StageRibbon active={active} />

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* LEFT PANE: FOCUS CADENCE CONSOLE */}
            <section className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant/40 bg-surface">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-primary text-[18px]"
                    >
                      schedule
                    </span>
                    <span className="text-xs font-semibold text-on-surface tracking-wider uppercase">
                      {CADENCE.TITLE}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary bg-surface-container px-2.5 py-0.5 rounded-full border border-outline-variant/30">
                    {PHASE_STRINGS.formatSessionProgress(sessionInCycle)}
                  </span>
                </div>

                <CadenceControls running={running} />
                <TimerDial
                  phase={phase}
                  progress={progress}
                  remainingMs={remainingMs}
                  stage={active.stage}
                />
              </div>

              <SessionControls
                phase={phase}
                running={running}
                start={start}
                skip={skip}
                intention={intention}
                onIntentionChange={setIntention}
              />
            </section>

            {/* RIGHT PANE: BOTANICAL TERRARIUM */}
            <section className="lg:col-span-7 bg-surface-container-low p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
              <SpecimenHeader plantCount={plants.length} active={active} />

              <div className="relative w-full rounded-xl overflow-hidden border border-outline-variant/50 shadow-inner my-4 select-none">
                <div className="w-full h-[280px] sm:h-[320px] relative">
                  <PlantCanvas />
                </div>
              </div>

              <StatsGrid blooms={blooms} focusMs={focusMs} workDone={workDone} />
            </section>
          </div>
        </div>
      </main>

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
