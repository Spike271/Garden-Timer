import { APP_STRINGS } from '../config';
import DaylightIcon from './DaylightIcon';

const { CIRCADIAN, PHASES: PHASE_STRINGS } = APP_STRINGS;
const PHASE_LABELS = PHASE_STRINGS.LABELS;

export default function Titlebar({ phase, running, isDaylight, timeString }) {
  return (
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
          <DaylightIcon isDaylight={isDaylight} />
          <span>
            {timeString || CIRCADIAN.DEFAULT_TIME} ·{' '}
            {isDaylight ? CIRCADIAN.DAYLIGHT_STUDIO : CIRCADIAN.EVENING_STUDIO}
          </span>
        </div>
      </div>

      {/* Right: Active Session Telemetry */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-semibold">
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
  );
}
