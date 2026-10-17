import { APP_STRINGS, WEATHER_CONFIG } from '../config';
import { PHASES } from '../state/constants';
import DaylightIcon from './DaylightIcon';

const { BRAND, PHASES: PHASE_STRINGS } = APP_STRINGS;
const { CIRCADIAN } = APP_STRINGS;
const PHASE_LABELS = PHASE_STRINGS.LABELS;
const LOGO_SRC = `${import.meta.env.BASE_URL}favicon.jpg`;

export default function AppHeader({ phase, running, isDaylight, timeString, weather }) {
  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant/40 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-outline-variant/50 shadow-xs">
              <img src={LOGO_SRC} alt={BRAND.LOGO_ALT} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl text-primary tracking-tight font-medium flex items-center gap-1.5">
                {BRAND.NAME}
              </span>
              <p className="text-xs text-on-surface-variant font-medium m-0">{BRAND.TAGLINE}</p>
            </div>
          </div>
        </div>

        {/* Circadian Studio Indicator (Center) */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/40 shadow-xs">
          <DaylightIcon isDaylight={isDaylight} className="w-4 h-4" />
          <span className="text-xs font-semibold text-on-surface tracking-wide">
            {isDaylight ? CIRCADIAN.DAYLIGHT_STUDIO : CIRCADIAN.EVENING_STUDIO} ·{' '}
            {timeString || CIRCADIAN.DEFAULT_TIME}
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span
            className="text-xs text-on-surface-variant transition-opacity duration-300"
            title={WEATHER_CONFIG.LOCATION.formatTooltip(weather.location)}
          >
            {weather.text}
          </span>
        </div>

        {/* Session State Badge & Return CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-xs font-semibold text-on-secondary-fixed-variant">
            <span
              className={`w-2 h-2 rounded-full ${
                phase === PHASES.WORK
                  ? running
                    ? 'bg-primary animate-pulse'
                    : 'bg-primary'
                  : 'bg-secondary'
              }`}
            ></span>
            <span>
              {running
                ? PHASE_STRINGS.formatPhaseActive(PHASE_LABELS[phase])
                : PHASE_STRINGS.formatPhaseReady(PHASE_LABELS[phase])}
            </span>
          </div>

          <a
            href="index.html"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors border border-outline-variant/40"
            title={BRAND.RETURN_CTA_TITLE}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>{BRAND.RETURN_CTA}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
