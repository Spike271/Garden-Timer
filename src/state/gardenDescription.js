export function describeGarden(plants, strings) {
  if (!plants?.length) return strings.CANVAS_ARIA_LABEL;
  const names = strings.STAGE_NAMES;
  const active = plants[plants.length - 1];
  const blooms = plants.filter((p) => p.stage >= names.length - 1 && !p.wilted).length;
  const state = `${names[Math.min(active.stage, names.length - 1)]}${active.wilted ? ', wilted' : ''}`;
  return `${strings.CANVAS_ARIA_LABEL}: ${plants.length} ${plants.length === 1 ? 'plant' : 'plants'}, ${blooms} in bloom. Current plant: ${state}.`;
}
