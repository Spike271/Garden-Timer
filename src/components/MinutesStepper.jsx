import { useState } from 'react';
import { APP_STRINGS } from '../config';
import { useHoldRepeat } from '../hooks/useHoldRepeat';

const { CADENCE } = APP_STRINGS;

// -/+ pill with hold-to-repeat and direct number entry. Buttons are 44x44 hit areas
export default function MinutesStepper({
  groupLabel,
  label,
  value,
  step,
  onStep,
  onCommit,
  decreaseAria,
  increaseAria,
}) {
  const decrease = useHoldRepeat(() => onStep(-step));
  const increase = useHoldRepeat(() => onStep(step));
  const [draft, setDraft] = useState(null);

  const commit = () => {
    if (draft !== null && draft !== '') onCommit(Number(draft));
    setDraft(null);
  };

  const btn =
    'touch-manipulation select-none text-on-surface-variant hover:text-primary transition-colors bg-transparent border-0 cursor-pointer flex items-center justify-center rounded-full w-11 h-11 -mx-3 -my-3.5 shrink-0';

  return (
    <fieldset
      aria-label={groupLabel}
      className="flex items-center gap-2 border-0 p-0 m-0 min-w-0"
    >
      {label && (
        <span className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
          {label}
        </span>
      )}
      <div
        className="flex items-center px-3 py-1.5 min-h-8 rounded-full border border-outline-variant/60 bg-surface-container-low"
        title={CADENCE.STEP_HINT(step)}
      >
        <button type="button" aria-label={decreaseAria} className={btn} {...decrease}>
          <svg
            aria-hidden="true"
            className="w-2.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="flex items-baseline justify-center w-12 text-sm text-on-surface-variant font-medium tabular-nums px-0">
          <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label={`${groupLabel} (${CADENCE.VALUE_ARIA_SUFFIX})`}
              value={draft ?? String(value)}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') {
                  setDraft(null);
                  e.currentTarget.blur();
                }
              }}
              className="w-7 h-11 -my-3.5 bg-transparent border-0 p-0 text-center text-sm text-on-surface-variant font-medium tabular-nums no-focus-outline outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
          />
              <span aria-hidden="true" className="pr-2.5">m</span>
        </span>
        <button type="button" aria-label={increaseAria} className={btn} {...increase}>
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5"
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
      <output className="sr-only">{`${groupLabel}: ${value} ${CADENCE.VALUE_ARIA_SUFFIX}`}</output>
    </fieldset>
  );
}
