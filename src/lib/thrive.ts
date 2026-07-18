import { prisma } from '@/lib/db'
import { PILLAR_KEYS } from '@/lib/pillars'

export type Scores = Record<string, number>

export async function saveReview(
  userId: string,
  email: string,
  period: string,
  scores: Scores,
  note?: string | null,
) {
  // keep only known pillars, clamp 0–10
  const clean: Scores = {}
  for (const k of PILLAR_KEYS) {
    const v = Number(scores[k])
    clean[k] = Number.isFinite(v) ? Math.max(0, Math.min(10, Math.round(v))) : 0
  }
  return prisma.pillarReview.create({
    data: { userId, email, period, scores: clean, note: note?.trim() || null },
  })
}

export async function getLatestReview(userId: string) {
  return prisma.pillarReview.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export async function getHistory(userId: string, limit = 12) {
  return prisma.pillarReview.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit })
}

export function overallScore(scores: Scores): number {
  const vals = PILLAR_KEYS.map((k) => Number(scores[k] ?? 0))
  return Math.round((vals.reduce((a, b) => a + b, 0) / PILLAR_KEYS.length) * 10) / 10
}
