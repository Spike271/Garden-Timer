import { useSettings } from '../state/SettingsContext';
import { APP_STRINGS } from '../config';
import MinutesStepper from './MinutesStepper';

const { CADENCE } = APP_STRINGS;

// Focus presets + steppers for focus, short break and long break lengths.
export default function CadenceControls({ running = false }) {
  const { presets, setMinutes, stepMinutes } = useSettings();

  return (
    <div className="mb-6 space-y-3">
      <fieldset
        disabled={running}
        aria-describedby={running ? 'cadence-locked' : undefined}
        className={`space-y-3 border-0 p-0 m-0 min-w-0 transition-opacity ${running ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-2">
          {CADENCE.PRESET_MINUTES.map((mins) => {
            const isSelected = presets.focusMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setMinutes('focusMinutes', mins)}
                className={`flex-1 min-h-9 text-center rounded-full border text-xs transition-all cursor-pointer ${
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
            groupLabel={CADENCE.FOCUS_LABEL}
            value={presets.focusMinutes}
            step={5}
            onStep={(d) => stepMinutes('focusMinutes', d)}
            onCommit={(v) => setMinutes('focusMinutes', v)}
            decreaseAria={CADENCE.DECREASE_MINUTES_ARIA}
            increaseAria={CADENCE.INCREASE_MINUTES_ARIA}
          />
        </div>

        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-8">
          <MinutesStepper
            groupLabel={CADENCE.SHORT_BREAK_LABEL}
            label={CADENCE.SHORT_BREAK_LABEL}
            value={presets.shortBreakMinutes}
            step={1}
            onStep={(d) => stepMinutes('shortBreakMinutes', d)}
            onCommit={(v) => setMinutes('shortBreakMinutes', v)}
            decreaseAria={CADENCE.DECREASE_SHORT_BREAK_ARIA}
            increaseAria={CADENCE.INCREASE_SHORT_BREAK_ARIA}
          />

          <MinutesStepper
            groupLabel={CADENCE.LONG_BREAK_LABEL}
            label={CADENCE.LONG_BREAK_LABEL}
            value={presets.longBreakMinutes}
            step={1}
            onStep={(d) => stepMinutes('longBreakMinutes', d)}
            onCommit={(v) => setMinutes('longBreakMinutes', v)}
            decreaseAria={CADENCE.DECREASE_LONG_BREAK_ARIA}
            increaseAria={CADENCE.INCREASE_LONG_BREAK_ARIA}
          />
        </div>
      </fieldset>
      <p
        id="cadence-locked"
        className={`text-xs text-on-surface-variant m-0 min-h-4 ${running ? '' : 'invisible'}`}
      >
        {CADENCE.LOCKED_NOTE}
      </p>
    </div>
  );
}
