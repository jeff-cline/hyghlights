import { prisma } from '@/lib/db'

export type Period = 'week' | 'month' | 'quarter' | 'year'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function rangeFor(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const d = now.getUTCDate()

  if (period === 'week') {
    // Monday-based week containing today.
    const dow = (now.getUTCDay() + 6) % 7 // 0 = Monday
    const start = new Date(Date.UTC(y, m, d - dow))
    const end = new Date(Date.UTC(y, m, d - dow + 7))
    return { start, end, label: 'This week' }
  }
  if (period === 'month') {
    return { start: new Date(Date.UTC(y, m, 1)), end: new Date(Date.UTC(y, m + 1, 1)), label: `${MONTHS[m]} ${y}` }
  }
  if (period === 'quarter') {
    const q = Math.floor(m / 3)
    return { start: new Date(Date.UTC(y, q * 3, 1)), end: new Date(Date.UTC(y, q * 3 + 3, 1)), label: `Q${q + 1} ${y}` }
  }
  return { start: new Date(Date.UTC(y, 0, 1)), end: new Date(Date.UTC(y + 1, 0, 1)), label: `${y} in review` }
}

export type Recap = {
  label: string
  total: number
  activeDays: number
  byCategory: Record<string, number>
  topCategory: string | null
  jarred: Array<{ id: string; category: string; text: string }>
}

export async function getRecap(userId: string, period: Period): Promise<Recap> {
  const { start, end, label } = rangeFor(period)
  const highlights = await prisma.highlight.findMany({
    where: { userId, entryDate: { gte: start, lt: end } },
    orderBy: { entryDate: 'asc' },
    select: { id: true, category: true, text: true, entryDate: true, inJar: true },
  })

  const byCategory: Record<string, number> = {}
  const days = new Set<string>()
  for (const h of highlights) {
    byCategory[h.category] = (byCategory[h.category] ?? 0) + 1
    days.add(new Date(h.entryDate).toISOString().slice(0, 10))
  }
  const topCategory =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  return {
    label,
    total: highlights.length,
    activeDays: days.size,
    byCategory,
    topCategory,
    jarred: highlights.filter((h) => h.inJar).map((h) => ({ id: h.id, category: h.category, text: h.text })),
  }
}
