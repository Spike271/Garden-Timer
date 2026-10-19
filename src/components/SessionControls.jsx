import { useEffect, useState } from 'react';
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
  const [confirming, setConfirming] = useState(false);
  const needsConfirm = running && phase === PHASES.WORK;
  // Derived, so a finished session can never leave the button stuck in the armed state.
  const armed = confirming && running;

  // Two-step forfeit: the first tap arms it for 4s, the second wilts the plant.
  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 4000);
    const onKey = (e) => e.key === 'Escape' && setConfirming(false);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      document.removeEventListener('keydown', onKey);
    };
  }, [confirming]);

  const onForfeit = () => {
    if (needsConfirm && !armed) return setConfirming(true);
    setConfirming(false);
    skip();
  };

  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center gap-2.5">
        {!running ? (
          <button
            type="button"
            onClick={start}
            className="flex-1 bg-primary hover:bg-surface-tint text-on-primary font-semibold text-xs py-3 min-h-11 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            <span>{PHASE_STRINGS.formatStartAction(PHASE_LABELS[phase])}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onForfeit}
            className={`flex-1 py-2 px-4 rounded-lg border text-xs min-h-11 font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
              armed
                ? 'border-error bg-error-container text-error'
                : 'border-outline-variant/60 bg-transparent text-on-surface-variant hover:text-tertiary hover:border-tertiary-container'
            }`}
            title={
              phase === PHASES.WORK
                ? PHASE_STRINGS.FORFEIT_CYCLE_TOOLTIP
                : PHASE_STRINGS.SKIP_BREAK_TOOLTIP
            }
          >
            <span>
              {armed
                ? CADENCE.CONFIRM_WILT
                : phase === PHASES.WORK
                  ? PHASE_STRINGS.FORFEIT_CYCLE
                  : PHASE_STRINGS.SKIP_BREAK}
            </span>
          </button>
        )}
      </div>

      {/* Mindful Intention Text Prompt Box */}
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 mb-1 text-on-surface-variant">
          <span aria-hidden="true" className="material-symbols-outlined text-[14px] text-primary">
            edit_note
          </span>
          <label
            htmlFor="intentionInput"
            className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            {CADENCE.INTENTION_LABEL}
          </label>
        </div>
        <input
          id="intentionInput"
          disabled="disabled"
          type="text"
          value={intention}
          onChange={(e) => onIntentionChange(e.target.value)}
          placeholder={CADENCE.INTENTION_PLACEHOLDER}
          className="w-full bg-transparent border-0 border-outline text-on-surface text-sm px-0 py-3 min-h-11 placeholder:text-on-surface-variant no-focus-outline outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
        />
      </div>
    </div>
  );
}
