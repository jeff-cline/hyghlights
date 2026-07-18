// The 8 pillars of the Whole-Person Concept — the axes you score yourself on
// in the iThrive review. Distinct from the highlight life-categories.
export type PillarKey =
  | 'HEALTH'
  | 'CAREER'
  | 'GROWTH'
  | 'SPIRIT'
  | 'RELATIONSHIPS'
  | 'SOCIAL'
  | 'QUALITY'
  | 'FINANCES'

export type Pillar = { key: PillarKey; label: string; emoji: string; color: string }

export const PILLARS: Pillar[] = [
  { key: 'HEALTH', label: 'Health & Fitness', emoji: '💪', color: '#e07800' },
  { key: 'CAREER', label: 'Career', emoji: '🚀', color: '#0D9488' },
  { key: 'GROWTH', label: 'Personal Growth', emoji: '🌱', color: '#e07800' },
  { key: 'SPIRIT', label: 'Spirituality', emoji: '🙏', color: '#0D9488' },
  { key: 'RELATIONSHIPS', label: 'Relationships', emoji: '❤️‍🩹', color: '#e07800' },
  { key: 'SOCIAL', label: 'Social & Leisure', emoji: '💃', color: '#0D9488' },
  { key: 'QUALITY', label: 'Quality of Life', emoji: '🏝️', color: '#e07800' },
  { key: 'FINANCES', label: 'Finances', emoji: '💰', color: '#0D9488' },
]

export const PILLAR_BY_KEY: Record<string, Pillar> = Object.fromEntries(PILLARS.map((p) => [p.key, p]))

export const PILLAR_KEYS = PILLARS.map((p) => p.key)
