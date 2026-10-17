import { APP_STRINGS } from '../config';
import { PHASES } from '../state/constants';

const { PHASES: PHASE_STRINGS, CADENCE } = APP_STRINGS;
const PHASE_LABELS = PHASE_STRINGS.LABELS;

export default function SessionControls({
  phase,
  running,
  start,
  skip,
  intention,
  onIntentionChange,
}) {
  return (
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
              {phase === PHASES.WORK ? PHASE_STRINGS.FORFEIT_CYCLE : PHASE_STRINGS.SKIP_BREAK}
            </span>
          </button>
        )}
      </div>

      {/* Mindful Intention Text Prompt Box */}
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 mb-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px] text-primary">edit_note</span>
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
          onChange={(e) => onIntentionChange(e.target.value)}
          placeholder={CADENCE.INTENTION_PLACEHOLDER}
          className="w-full bg-transparent border-0 border-b border-outline-variant/40 focus:border-primary focus:ring-0 text-on-surface text-xs px-0 py-0.5 placeholder:text-outline-variant outline-none"
        />
      </div>
    </div>
  );
}
