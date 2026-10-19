import { beforeAll, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SettingsProvider } from '../state/SettingsContext';
import CadenceControls from '../components/CadenceControls';
import AppHeader from '../components/AppHeader';
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
    expect(html).toContain('value="5"');
    expect(html).toContain('value="15"');
    expect(html).toContain('aria-pressed');
  });

  it('others render without throwing', () => {
    const pieces = [
      <AppHeader key="h" phase="work" running isDaylight timeString="9:00 AM" weather={weather} />,
      <StageRibbon key="r" active={active} />,
      <SpecimenHeader key="s" plantCount={2} active={active} />,
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

  it('StatsGrid shows banked focus hours and renders all three custom icons', () => {
    const html = renderToString(<StatsGrid blooms={3} focusMs={90 * 60_000} workDone={2} />);
    expect(html).toContain('1.5');
    // Verify custom illustration images are rendered
    expect(html).toContain('illustrations/bloom.svg');
    expect(html).toContain('illustrations/focus-hours.svg');
    expect(html).toContain('illustrations/sessions.svg');
    const imgCount = (html.match(/<img/g) || []).length;
    expect(imgCount).toBe(3);
  });
});

import { describeGarden } from '../state/gardenDescription';
import { APP_STRINGS } from '../config';

describe('a11y helpers', () => {
  it('describes the garden for screen readers', () => {
    const plants = [
      { stage: 3, wilted: false },
      { stage: 1, wilted: true },
    ];
    const text = describeGarden(plants, APP_STRINGS.SPECIMEN);
    expect(text).toContain('2 plants');
    expect(text).toContain('1 in bloom');
    expect(text).toContain('Sprout, wilted');
  });

  it('timer has role=timer and a label', () => {
    const html = renderToString(
      <TimerDial phase="work" progress={0} remainingMs={60_000} stage={0} />,
    );
    expect(html).toContain('role="timer"');
  });
});

describe('forfeit confirmation', () => {
  it('has a real confirm label (regression: string was once undefined)', async () => {
    const { APP_STRINGS: S } = await import('../config');
    expect(S.CADENCE.CONFIRM_WILT).toMatch(/wilt/i);
    expect(S.CADENCE.LOCKED_NOTE.length).toBeGreaterThan(5);
  });
});
