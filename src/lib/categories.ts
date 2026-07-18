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
  { key: 'HEALTH_FITNESS', label: 'Health & Fitness', emoji: '💪', color: '#C9A24B' },
  { key: 'CAREER_BUSINESS', label: 'Career & Business', emoji: '🚀', color: '#34c5c5' },
  { key: 'FINANCES', label: 'Finances', emoji: '💰', color: '#C9A24B' },
  { key: 'RELATIONSHIPS', label: 'Relationships', emoji: '❤️', color: '#34c5c5' },
  { key: 'PERSONAL_DEVELOPMENT', label: 'Personal Development', emoji: '🌱', color: '#C9A24B' },
  { key: 'FAITH', label: 'Faith', emoji: '🙏', color: '#34c5c5' },
  { key: 'SOCIAL_LEISURE', label: 'Social & Leisure', emoji: '🎉', color: '#C9A24B' },
  { key: 'QUALITY_REPUTATION', label: 'Quality of Life & Reputation', emoji: '✨', color: '#34c5c5' },
]

export const CATEGORY_BY_KEY: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
)

export function categoryLabel(key: string): string {
  return CATEGORY_BY_KEY[key]?.label ?? key
}
