import { APP_STRINGS } from '../config';

const { SPECIMEN, STATS } = APP_STRINGS;
const STAGE_NAMES = SPECIMEN.STAGE_NAMES;

export default function StatsGrid({ active, blooms, focusMs, workDone }) {
  return (
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
          {(focusMs / 3_600_000).toFixed(1)}{' '}
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
  );
}
