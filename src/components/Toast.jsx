import { APP_STRINGS } from '../config';

const { NOTIFICATIONS } = APP_STRINGS;

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 w-full toast-botanical">
      <output
        className={`flex items-center justify-between px-5 py-3 rounded-xl border shadow-sm transition-all duration-300 ${
          toast.type === 'warning'
            ? 'bg-error-container/80 border-error/30 text-on-error-container'
            : 'bg-surface-container-low border-outline-variant/60 text-on-surface'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined text-[20px] ${
              toast.type === 'warning' ? 'text-error' : 'text-primary'
            }`}
          >
            {toast.type === 'warning' ? 'energy_savings_leaf' : 'potted_plant'}
          </span>
          <p className="text-sm font-normal m-0">
            <strong
              className={`text-xs uppercase mr-2 tracking-wider font-semibold ${
                toast.type === 'warning' ? 'text-error' : 'text-primary'
              }`}
            >
              {toast.type === 'warning'
                ? NOTIFICATIONS.BADGE_INTERRUPTION
                : NOTIFICATIONS.BADGE_GROWTH}
            </strong>
            {toast.text}
          </p>
        </div>
        <button
          type="button"
          aria-label={NOTIFICATIONS.DISMISS_ARIA}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-full transition-colors bg-transparent border-0 cursor-pointer"
          onClick={() => onDismiss()}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </output>
    </div>
  );
}
