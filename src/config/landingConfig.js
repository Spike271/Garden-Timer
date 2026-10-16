export const LANDING_CONFIG = Object.freeze({
  STAGE_NAMES: Object.freeze(['Seed Rest', 'Sprout', 'Sapling', 'Bloom', 'Full Garden']),

  TIMELAPSE_PHASES: Object.freeze({
    WILTED: 'Consequence: Interrupted Session Wilts Foliage',
    PHASE_1: 'Phase 1: Seed Germinating in Morning Mist',
    PHASE_2: 'Phase 2: Tender Sprout Unfurling in Midday Sun',
    PHASE_3: 'Phase 3: Branching Sapling Canopy in Golden Hour',
    PHASE_4: 'Phase 4: Japanese Maple Blossoms in Full Bloom',
    PHASE_5: 'Phase 5: Flourishing Sanctuary Grove Under Night Stars',
    INITIAL_TIMELINE: 'Timeline: 06:00 AM · Seed Resting',
  }),

  BUTTON_LABELS: Object.freeze({
    PLAY_TIMELAPSE: 'Play Growth Timelapse',
    PAUSE_TIMELAPSE: 'Pause Timelapse',
    REPLAY_TIMELAPSE: 'Replay Timelapse',
    CANVAS_TIMELAPSE: 'Timelapse',
    CANVAS_PAUSE: 'Pause',
    TEST_WILT: 'Test Wilt',
    HEAL_WILT: 'Heal Wilt',
    START_FOCUS: 'Start Deep Focus',
    PAUSE_FOCUS: 'Pause Focus',
    RESUME_FOCUS: 'Resume Focus',
    CYCLE_COMPLETE: 'Cycle Complete',
  }),

  TOOLTIPS: Object.freeze({
    WILT_DISABLED: 'Wilt preview is disabled while timelapse is running',
    HEAL_WILT: 'Click to heal wilted specimen',
    TEST_WILT: 'Simulate what happens when leaving early',
  }),

  CIRCADIAN_STUDIOS: Object.freeze({
    DAYLIGHT_STUDIO: 'Daylight Studio',
    EVENING_STUDIO: 'Evening Studio',
    MORNING_DAWN: 'Morning Dawn',
    GOLDEN_HOUR: 'Golden Hour',
    NIGHT_SANCTUARY: 'Night Sanctuary',
  }),

  SESSION_STATUS: Object.freeze({
    formatTimelapseActive: (speed) => `Timelapse Active (${speed}x)`,
    ACTIVE_FOCUS: 'Active Focus Session',
    SAMPLE_SIMULATOR: 'Sample Simulator',
  }),

  TAXONOMIC_BEDS: Object.freeze({
    WILTED: 'Specimen Wilted (Interrupted)',
    SANCTUARY_GROVE: 'Sanctuary Grove: Linen Bed',
    NURSERY_BED: 'Nursery Bed: Peat & Clay',
  }),

  DIAL_DESCRIPTIONS: Object.freeze({
    FLOURISHING_GROVE: 'Flourishing Sanctuary Grove',
    formatNurturing: (stageName) => `Nurturing ${stageName}`,
  }),

  SUN_LABELS: Object.freeze({
    GOLDEN_SUN: 'Golden Sun',
    FILTERED_SUN: 'Filtered Sun',
    MOONLIGHT_REST: 'Moonlight Rest',
  }),

  // Real readouts for the demo plant. The demo has 4 growth stages.
  GROWTH_READOUT: Object.freeze({
    TOTAL_STAGES: 4,
    WILTED: 'Wilted',
    format: (stageIndex, total) => `Growth ${stageIndex + 1} / ${total}`,
  }),
  SPECIMEN_LABELS: Object.freeze({
    formatNumber: (n) => `Specimen No. ${String(n).padStart(3, '0')}`,
    formatGarden: (count) => `Your garden · ${count} ${count === 1 ? 'plant' : 'plants'}`,
  }),

  TELEMETRY: Object.freeze({
    HOURS_UNIT: 'hrs',
    SESSION_UNIT: 'session',
    SESSIONS_UNIT: 'sessions',
    WILTED_SUFFIX: ' (Wilted)',
    MINUTES_SUFFIX: 'm',
    formatHeroPillTimelapse: (percent) => `Timelapse (${percent}%)`,
    formatHeroPillStandard: (timeStr, stageName) => `${timeStr} · ${stageName}`,
    formatStageBadge: (index, stageName, isCurrent) => {
      const prefix = index < 4 ? `${index + 1}. ` : '';
      const suffix = isCurrent ? ' (Current)' : '';
      return `${prefix}${stageName}${suffix}`;
    },
  }),
});
