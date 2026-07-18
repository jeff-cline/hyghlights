// Gamification: badges earned from streaks, volume, and breadth. Pure function
// so both HYghLights and the Beyond Limits Community tab compute them the same.
export type Badge = {
  key: string
  label: string
  emoji: string
  earned: boolean
  hint: string
}

export function computeBadges(input: {
  currentStreak: number
  longestStreak: number
  total: number
  distinctCategories: number
}): Badge[] {
  const { longestStreak, total, distinctCategories } = input
  const defs: Array<[string, string, string, boolean, string]> = [
    ['first', 'First Win', '🌟', total >= 1, 'Log your first highlight'],
    ['ten', 'Perfect 10', '💛', total >= 10, 'Log 10 highlights'],
    ['fifty', 'On Fire', '🎯', total >= 50, 'Log 50 highlights'],
    ['hundred', 'Century', '💎', total >= 100, 'Log 100 highlights'],
    ['streak3', 'Warming Up', '🔥', longestStreak >= 3, 'Reach a 3-day streak'],
    ['streak7', 'Unstoppable', '⚡', longestStreak >= 7, 'Reach a 7-day streak'],
    ['streak30', 'Relentless', '🏆', longestStreak >= 30, 'Reach a 30-day streak'],
    ['streak100', 'Legend', '👑', longestStreak >= 100, 'Reach a 100-day streak'],
    ['wholelife', 'Whole Life', '🌈', distinctCategories >= 8, 'Log a win in all 8 categories'],
  ]
  return defs.map(([key, label, emoji, earned, hint]) => ({ key, label, emoji, earned, hint }))
}

export function earnedCount(badges: Badge[]): number {
  return badges.filter((b) => b.earned).length
}
