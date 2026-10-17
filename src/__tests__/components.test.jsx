import { beforeAll, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SettingsProvider } from '../state/SettingsContext';
import CadenceControls from '../components/CadenceControls';
import AppHeader from '../components/AppHeader';
import Titlebar from '../components/Titlebar';
import StageRibbon from '../components/StageRibbon';
import SpecimenHeader from '../components/SpecimenHeader';
import StatsGrid from '../components/StatsGrid';
import TimerDial from '../components/TimerDial';
import SessionControls from '../components/SessionControls';
import Toast from '../components/Toast';

// Smoke renders: catch undefined references left over from the App.jsx split.
const active = { stage: 1, wilted: false };
const weather = { text: 'Clear', location: null };

beforeAll(() => {
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
});

describe('extracted components render', () => {
  it('CadenceControls shows focus and both break steppers', () => {
    const html = renderToString(
      <SettingsProvider>
        <CadenceControls />
      </SettingsProvider>,
    );
    expect(html).toContain('Short break');
    expect(html).toContain('Long break');
    expect(html).toContain('Increase long break minutes');
    expect(html).toContain('5m');
    expect(html).toContain('15m');
  });

  it('others render without throwing', () => {
    const pieces = [
      <AppHeader key="h" phase="work" running isDaylight timeString="9:00 AM" weather={weather} />,
      <Titlebar key="t" phase="shortBreak" running={false} isDaylight={false} timeString="" />,
      <StageRibbon key="r" active={active} />,
      <SpecimenHeader key="s" plantCount={2} active={active} isDaylight />,
      <TimerDial key="d" phase="work" progress={0.4} remainingMs={90_000} stage={1} />,
      <SessionControls
        key="c"
        phase="work"
        running={false}
        start={() => {}}
        skip={() => {}}
        intention="x"
        onIntentionChange={() => {}}
      />,
      <Toast key="x" toast={{ text: 'hi', type: 'warning' }} onDismiss={() => {}} />,
    ];
    for (const el of pieces) expect(() => renderToString(el)).not.toThrow();
  });

  it('StatsGrid shows banked focus hours, not workDone * current length', () => {
    const html = renderToString(
      <StatsGrid active={active} blooms={0} focusMs={90 * 60_000} workDone={2} />,
    );
    expect(html).toContain('1.5');
  });
});
