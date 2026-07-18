import { prisma } from '@/lib/db'
import { WEEKLY_KEYS, type WScores } from '@/lib/weekly-constants'

// Re-export the client-safe constants/helpers so server code can import
// everything from '@/lib/weekly' while client components import the
// prisma-free '@/lib/weekly-constants'.
export * from '@/lib/weekly-constants'

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
