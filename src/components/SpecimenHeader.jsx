import { APP_STRINGS } from '../config';
import DaylightIcon from './DaylightIcon';

const { CIRCADIAN, SPECIMEN } = APP_STRINGS;
const STAGE_NAMES = SPECIMEN.STAGE_NAMES;

export default function SpecimenHeader({ plantCount, active, isDaylight }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-primary tracking-widest uppercase">
            {SPECIMEN.formatNumber(plantCount)}
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span className="text-[10px] font-medium text-on-surface-variant">
            {SPECIMEN.formatGarden(plantCount)}
          </span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl text-on-surface mt-0.5 mb-0 font-normal">
          {SPECIMEN.TREE_NAME}
        </h3>
      </div>

      <div className="flex items-center gap-3 bg-surface px-3 py-1.5 rounded-lg border border-outline-variant/40 self-start sm:self-auto text-xs">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
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
          <DaylightIcon isDaylight={isDaylight} />
          <span className="font-semibold text-on-surface">
            {isDaylight ? CIRCADIAN.FILTERED_SUN : CIRCADIAN.NIGHT_REST}
          </span>
        </div>
      </div>
    </div>
  );
}
