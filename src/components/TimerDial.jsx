import { APP_STRINGS } from '../config';
import { PHASES } from '../state/constants';

const { PHASES: PHASE_STRINGS, SPECIMEN } = APP_STRINGS;
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

export default function TimerDial({ phase, progress, remainingMs, stage }) {
  return (
    <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto my-3 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
        <circle cx="130" cy="130" r={RING_R} fill="transparent" stroke="#dce5db" strokeWidth="8" />
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
            ? SPECIMEN.formatNurturing(STAGE_NAMES[stage])
            : SPECIMEN.RESTORATIVE_PAUSE}
        </span>
      </div>
    </div>
  );
}
