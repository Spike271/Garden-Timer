import { APP_STRINGS } from '../config';

const { CADENCE } = APP_STRINGS;

// Compact -/+ pill. onStep receives the signed delta in minutes.
export default function MinutesStepper({ label, value, step, onStep, decreaseAria, increaseAria }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {label && (
        <span className="text-[11px] font-medium text-on-surface-variant whitespace-nowrap">
          {label}
        </span>
      )}
      <div className="flex items-center justify-between px-2 py-0.5 rounded-full border border-outline-variant/60 bg-surface-container-low">
        <button
          type="button"
          aria-label={decreaseAria}
          onClick={() => onStep(-step)}
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
          {CADENCE.formatStepperLabel(value)}
        </span>
        <button
          type="button"
          aria-label={increaseAria}
          onClick={() => onStep(step)}
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
  );
}
