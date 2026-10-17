import { useSettings } from '../state/SettingsContext';
import { APP_STRINGS } from '../config';
import MinutesStepper from './MinutesStepper';

const { CADENCE } = APP_STRINGS;

// Focus presets + steppers for focus, short break and long break lengths.
export default function CadenceControls() {
  const { presets, setMinutes, stepMinutes } = useSettings();

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2">
        {CADENCE.PRESET_MINUTES.map((mins) => {
          const isSelected = presets.focusMinutes === mins;
          return (
            <button
              key={mins}
              type="button"
              onClick={() => setMinutes('focusMinutes', mins)}
              className={`flex-1 py-1.5 text-center rounded-full border text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-secondary-container text-on-secondary-fixed-variant font-semibold shadow-xs'
                  : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-medium'
              }`}
            >
              {CADENCE.formatPresetLabel(mins)}
            </button>
          );
        })}
        <MinutesStepper
          value={presets.focusMinutes}
          step={5}
          onStep={(d) => stepMinutes('focusMinutes', d)}
          decreaseAria={CADENCE.DECREASE_MINUTES_ARIA}
          increaseAria={CADENCE.INCREASE_MINUTES_ARIA}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <MinutesStepper
          label={CADENCE.SHORT_BREAK_LABEL}
          value={presets.shortBreakMinutes}
          step={1}
          onStep={(d) => stepMinutes('shortBreakMinutes', d)}
          decreaseAria={CADENCE.DECREASE_SHORT_BREAK_ARIA}
          increaseAria={CADENCE.INCREASE_SHORT_BREAK_ARIA}
        />
        <MinutesStepper
          label={CADENCE.LONG_BREAK_LABEL}
          value={presets.longBreakMinutes}
          step={1}
          onStep={(d) => stepMinutes('longBreakMinutes', d)}
          decreaseAria={CADENCE.DECREASE_LONG_BREAK_ARIA}
          increaseAria={CADENCE.INCREASE_LONG_BREAK_ARIA}
        />
      </div>
    </div>
  );
}
