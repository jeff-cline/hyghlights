import { prisma } from '@/lib/db'

export type WeeklyKey = 'WORKOUTS' | 'NUTRITION' | 'HYDRATION' | 'PRIORITIES' | 'ACCOMPLISHMENTS' | 'SLEEP'

export type WeeklyCat = { key: WeeklyKey; label: string; emoji: string; tip: string }

// The 6 weekly-review axes + a targeted tip used when the score is low.
export const WEEKLY_CATEGORIES: WeeklyCat[] = [
  { key: 'WORKOUTS', label: 'Workouts & Movement', emoji: '💪', tip: 'Block 3 non-negotiable movement sessions on your calendar 💪 — even 34 minutes counts.' },
  { key: 'NUTRITION', label: 'Nutrition', emoji: '🥗', tip: 'Prep two meals ahead so hunger never makes the call 🥗.' },
  { key: 'HYDRATION', label: 'Hydration', emoji: '💧', tip: 'Down a full glass before coffee ☀️ — aim for half your bodyweight in ounces 💧.' },
  { key: 'PRIORITIES', label: 'Priorities', emoji: '🎯', tip: 'Pick your ONE needle-mover each morning and protect it 🎯.' },
  { key: 'ACCOMPLISHMENTS', label: 'Accomplishments', emoji: '🏆', tip: 'Capture 3 wins nightly — momentum compounds 🏆.' },
  { key: 'SLEEP', label: 'Sleep', emoji: '😴', tip: 'Set a wind-down alarm 45 min before bed; screens off, lights low 😴.' },
]

export const WEEKLY_BY_KEY: Record<string, WeeklyCat> = Object.fromEntries(WEEKLY_CATEGORIES.map((c) => [c.key, c]))
export const WEEKLY_KEYS = WEEKLY_CATEGORIES.map((c) => c.key)

export type WScores = Record<string, number>

export function weeklyOverall(scores: WScores): number {
  const vals = WEEKLY_KEYS.map((k) => Number(scores[k] ?? 0))
  return Math.round((vals.reduce((a, b) => a + b, 0) / WEEKLY_KEYS.length) * 10) / 10
}

// Three practical recommendations: the lowest-scoring areas get their targeted
// tip. If everything is strong, celebrate the routine.
export function recommendations(scores: WScores): string[] {
  const ranked = [...WEEKLY_CATEGORIES]
    .map((c) => ({ c, v: Number(scores[c.key] ?? 0) }))
    .sort((a, b) => a.v - b.v)
  const weak = ranked.filter((r) => r.v <= 7).slice(0, 3)
  if (weak.length === 0) {
    return ['You’re firing on all cylinders 🔥 — protect the routine that got you here.']
  }
  return weak.map((r) => r.c.tip)
}

export async function saveWeekly(userId: string, email: string, scores: WScores, note?: string | null) {
  const clean: WScores = {}
  for (const k of WEEKLY_KEYS) {
    const v = Number(scores[k])
    clean[k] = Number.isFinite(v) ? Math.max(0, Math.min(10, Math.round(v))) : 0
  }
  return prisma.weeklyReview.create({ data: { userId, email, scores: clean, note: note?.trim() || null } })
}

export async function getLatestWeekly(userId: string) {
  return prisma.weeklyReview.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export async function getWeeklyHistory(userId: string, limit = 12) {
  return prisma.weeklyReview.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit })
}
