/**
 * Icon names reach the site from a free-text CMS field and from a seed that was
 * written with Lucide names ("shield-check", "zap"), while every render site does
 * `fa-solid ${icon}` — so those rows render an empty box. Normalise here, once,
 * for every caller: strip a leading `fa-`, map the known non-FA names, re-prefix.
 */
const ALIASES: Record<string, string> = {
  'shield-check': 'shield-halved',
  'check-circle': 'circle-check',
  'trending-up': 'arrow-trend-up',
  'bar-chart': 'chart-column',
  'pie-chart': 'chart-pie',
  'help-circle': 'circle-question',
  'alert-circle': 'circle-exclamation',
  'external-link': 'arrow-up-right-from-square',
  settings: 'gear',
  cog: 'gear',
  zap: 'bolt',
  home: 'house',
  target: 'bullseye',
  award: 'trophy',
  tool: 'screwdriver-wrench',
  package: 'box',
  activity: 'wave-square',
  layers: 'layer-group',
  search: 'magnifying-glass',
  mail: 'envelope',
  edit: 'pen',
  trash: 'trash-can',
};

export function faIcon(name?: string | null, fallback = 'fa-star'): string {
  if (!name) return fallback;
  const bare = String(name).trim().replace(/^fa-(solid|regular|brands)?-?/, '');
  if (!bare) return fallback;
  return `fa-${ALIASES[bare] || bare}`;
}

export default faIcon;
