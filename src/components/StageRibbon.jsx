import { APP_STRINGS } from '../config';

const { SPECIMEN } = APP_STRINGS;
const STAGE_NAMES = SPECIMEN.STAGE_NAMES;

export default function StageRibbon({ active }) {
  return (
    <div className="bg-surface border-b border-outline-variant/40 px-4 sm:px-6 py-3 overflow-x-auto">
      <div className="flex items-center justify-between sm:min-w-[580px] gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-on-surface-variant font-medium">
            {SPECIMEN.PROGRESSION_TITLE}
          </span>
          {STAGE_NAMES.map((name, idx) => {
            const isCurrent = active.stage === idx;
            const isPast = active.stage > idx;
            return (
              <div
                key={name}
                className={`items-center gap-2 ${isCurrent ? 'flex' : 'hidden sm:flex'}`}
              >
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-xs ${
                    isCurrent
                      ? active.wilted
                        ? 'bg-error-container/70 border border-error text-error font-semibold'
                        : 'bg-secondary-container text-on-secondary-fixed-variant font-semibold'
                      : isPast
                        ? 'bg-surface-container-low border border-outline-variant/40 text-secondary'
                        : 'text-on-surface-variant'
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
                    aria-hidden="true"
                    className="hidden sm:block w-3.5 h-3.5 text-outline-variant"
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
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs ${
            active.wilted
              ? 'bg-error-container text-error border border-error/40 font-medium'
              : 'text-tertiary bg-tertiary-fixed/30 border border-tertiary-fixed font-medium'
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[13px]">
            {active.wilted ? 'warning' : 'energy_savings_leaf'}
          </span>
          <span>{active.wilted ? SPECIMEN.WILTED_WARNING : SPECIMEN.WILT_WARNING}</span>
        </div>
      </div>
    </div>
  );
}
