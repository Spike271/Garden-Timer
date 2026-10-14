import { PHASES } from '../state/constants';

export const APP_STRINGS = Object.freeze({
  BRAND: Object.freeze({
    NAME: 'Garden Timer',
    TAGLINE: 'Mindful Botanical Focus',
    FOOTER_TAGLINE: 'Cultivating mindful sessions and deliberate botanical pacing',
    FOOTER_COPYRIGHT: '© 2026 Garden Timer',
    LOGO_ALT: 'Garden Timer Logo',
    RETURN_CTA: 'Landing Page',
    RETURN_CTA_TITLE: 'Return to Landing Page',
  }),

  CIRCADIAN: Object.freeze({
    DAYLIGHT_STUDIO: 'Daylight Studio',
    EVENING_STUDIO: 'Evening Studio',
    DEFAULT_TIME: '12:00 PM',
    FILTERED_SUN: 'Filtered Sun',
    NIGHT_REST: 'Night Rest',
  }),

  SOUNDSCAPE: Object.freeze({
    GREENHOUSE_RAIN: 'Rain on Greenhouse Glass',
  }),

  PHASES: Object.freeze({
    LABELS: Object.freeze({
      [PHASES.WORK]: 'Deep Focus',
      [PHASES.SHORT_BREAK]: 'Short Break',
      [PHASES.LONG_BREAK]: 'Long Break',
    }),
    formatPhaseReady: (phaseLabel) => `${phaseLabel} Ready`,
    formatPhaseActive: (phaseLabel) => `Active ${phaseLabel}`,
    formatStartAction: (phaseLabel) => `Start ${phaseLabel}`,
    formatSessionProgress: (currentSession, totalSessions = 4) =>
      `Session ${currentSession} of ${totalSessions}`,
    FORFEIT_CYCLE: 'Forfeit Cycle (Wilt)',
    SKIP_BREAK: 'Skip Break',
    FORFEIT_CYCLE_TOOLTIP: 'Skipping will wilt your active seedling',
    SKIP_BREAK_TOOLTIP: 'Skip break and start next focus session',
  }),

  NOTIFICATIONS: Object.freeze({
    WORK_COMPLETE: 'Cycle complete: your botanical specimen grew to the next stage!',
    WORK_SKIPPED: 'Session skipped: your seedling wilted from sudden interruption.',
    BADGE_INTERRUPTION: 'Interruption',
    BADGE_GROWTH: 'Sanctuary Growth',
    DISMISS_ARIA: 'Dismiss notification',
  }),

  CADENCE: Object.freeze({
    TITLE: 'Focus Cadence',
    PRESET_MINUTES: Object.freeze([25, 45, 50]),
    formatPresetLabel: (minutes) => `${minutes} min`,
    formatStepperLabel: (minutes) => `${minutes}m`,
    DECREASE_MINUTES_ARIA: 'Decrease focus minutes',
    INCREASE_MINUTES_ARIA: 'Increase focus minutes',
    DEFAULT_INTENTION: 'Nurture deep concentration and thoughtful craft',
    INTENTION_LABEL: 'Mindful Intention',
    INTENTION_PLACEHOLDER: 'What deliberate act will nourish this growth?',
  }),

  SPECIMEN: Object.freeze({
    NUMBER: 'Specimen No. 042',
    PLOT_LOCATION: 'Active Soil Nursery: Linen Plot 04',
    SPECIES_NAME: 'Acer Palmatum (Japanese Maple)',
    PROGRESSION_TITLE: 'Progression Cycle:',
    STAGE_NAMES: Object.freeze(['Seed Rest', 'Sprout', 'Sapling', 'Bloom']),
    formatStageLabel: (stageIndex, stageName, isCurrent) =>
      `${stageIndex + 1}. ${stageName}${isCurrent ? ' (Current)' : ''}`,
    formatNurturing: (stageName) => `Nurturing ${stageName}`,
    RESTORATIVE_PAUSE: 'Restorative Pause',
    WILT_WARNING: 'Leaving early wilts plant',
    WILTED_WARNING: 'Seedling wilted from interruption',
    MOISTURE_HEALTHY: '94%',
    MOISTURE_WILTED: '38%',
    CANVAS_ARIA_LABEL: 'Your garden',
  }),

  STATS: Object.freeze({
    STAGE_LABEL: 'Stage',
    WILTED_SUFFIX: ' (Wilted)',
    BLOOMS_TODAY_LABEL: 'Blooms Today',
    FOCUS_HOURS_LABEL: 'Focus Hours',
    HOURS_UNIT: 'hrs',
    SANCTUARY_STREAK_LABEL: 'Sanctuary Streak',
    DAYS_UNIT: 'Days',
    DEFAULT_STREAK_DAYS: 4,
  }),
});
