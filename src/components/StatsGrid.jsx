import { APP_STRINGS } from '../config';

const { STATS } = APP_STRINGS;
const BASE_URL = import.meta.env.BASE_URL;

export default function StatsGrid({ blooms, focusMs, workDone }) {
  const statItems = [
    {
      label: STATS.BLOOMS_TODAY_LABEL,
      value: blooms,
      unit: '',
      iconSrc: `${BASE_URL}illustrations/bloom.svg`,
      bgIcon: 'bg-tertiary-container/30',
    },
    {
      label: STATS.FOCUS_HOURS_LABEL,
      value: (focusMs / 3_600_000).toFixed(1),
      unit: STATS.HOURS_UNIT,
      iconSrc: `${BASE_URL}illustrations/focus-hours.svg`,
      bgIcon: 'bg-primary-container/30',
    },
    {
      label: STATS.SESSIONS_LABEL,
      value: workDone,
      unit: workDone === 1 ? STATS.SESSION_UNIT : STATS.SESSIONS_UNIT,
      iconSrc: `${BASE_URL}illustrations/sessions.svg`,
      bgIcon: 'bg-secondary-container/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-outline-variant/30">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className="p-2.5 rounded-lg bg-surface border border-outline-variant/30 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {item.label}
            </span>
            <span
              className={`w-7 h-7 flex items-center justify-center rounded-lg ${item.bgIcon}`}
            >
              <img
                src={item.iconSrc}
                alt=""
                aria-hidden="true"
                className="w-[18px] h-[18px] object-contain select-none pointer-events-none"
              />
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-base sm:text-lg text-secondary font-medium">
              {item.value}
            </span>
            {item.unit && (
              <span className="text-xs font-sans text-on-surface-variant font-normal">
                {item.unit}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
