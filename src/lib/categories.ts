// The 8 life categories every highlight is filed under (the whole-person
// pillars). Kept as a plain list so adding one never needs a migration.
export type CategoryKey =
  | 'HEALTH_FITNESS'
  | 'CAREER_BUSINESS'
  | 'FINANCES'
  | 'RELATIONSHIPS'
  | 'PERSONAL_DEVELOPMENT'
  | 'FAITH'
  | 'SOCIAL_LEISURE'
  | 'QUALITY_REPUTATION'

export type Category = {
  key: CategoryKey
  label: string
  emoji: string
  color: string // matte-gold / teal accents on the dark HYghLights canvas
}

export const CATEGORIES: Category[] = [
  { key: 'HEALTH_FITNESS', label: 'Health & Fitness', emoji: '💪', color: '#e07800' },
  { key: 'CAREER_BUSINESS', label: 'Career & Business', emoji: '🚀', color: '#0D9488' },
  { key: 'FINANCES', label: 'Finances', emoji: '💰', color: '#e07800' },
  { key: 'RELATIONSHIPS', label: 'Relationships', emoji: '❤️', color: '#0D9488' },
  { key: 'PERSONAL_DEVELOPMENT', label: 'Personal Development', emoji: '🌱', color: '#e07800' },
  { key: 'FAITH', label: 'Faith', emoji: '🙏', color: '#0D9488' },
  { key: 'SOCIAL_LEISURE', label: 'Social & Leisure', emoji: '🎉', color: '#e07800' },
  { key: 'QUALITY_REPUTATION', label: 'Quality of Life & Reputation', emoji: '✨', color: '#0D9488' },
]

export const CATEGORY_BY_KEY: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
)

export function categoryLabel(key: string): string {
  return CATEGORY_BY_KEY[key]?.label ?? key
}
