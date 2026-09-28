import { prisma } from '@/lib/db'

// Day bucket = UTC midnight, so a highlight belongs to one calendar day and
// streaks compare whole days.
export function dayStart(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((dayStart(b).getTime() - dayStart(a).getTime()) / 86_400_000)
}

export async function getOrCreateProfile(userId: string, email: string) {
  const existing = await prisma.profile.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.profile.create({ data: { userId, email } })
}

// Add a highlight for today and roll the streak forward. Returns the highlight
// plus the streak AFTER this entry and whether it just extended.
export async function addHighlight(
  userId: string,
  email: string,
  input: {
    category: string; text: string
    photoUrl?: string | null; videoUrl?: string | null
    /** PUBLIC goes on the wall; PRIVATE is only ever visible to its author. */
    visibility?: 'PUBLIC' | 'PRIVATE'
  },
) {
  const today = dayStart()
  const profile = await getOrCreateProfile(userId, email)

  let current = profile.currentStreak
  let extended = false
  if (!profile.lastEntryDate) {
    current = 1
    extended = true
  } else {
    const gap = daysBetween(profile.lastEntryDate, today)
    if (gap === 0) {
      // already logged today — streak unchanged
      current = Math.max(current, 1)
    } else if (gap === 1) {
      current = current + 1
      extended = true
    } else {
      current = 1
      extended = true
    }
  }
  const longest = Math.max(profile.longestStreak, current)

  const [highlight] = await prisma.$transaction([
    prisma.highlight.create({
      data: {
        userId,
        email,
        entryDate: today,
        // Defaults to PRIVATE when unspecified, which is the safe direction:
        // a caller that forgets to say keeps the post to its author rather than
        // publishing it to everyone.
        visibility: input.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
        category: input.category,
        text: input.text,
        photoUrl: input.photoUrl ?? null,
        videoUrl: input.videoUrl ?? null,
      },
    }),
    prisma.profile.update({
      where: { userId },
      data: { currentStreak: current, longestStreak: longest, lastEntryDate: today },
    }),
  ])

  return { highlight, currentStreak: current, longestStreak: longest, extended }
}

export async function getHomeData(userId: string, email: string) {
  const profile = await getOrCreateProfile(userId, email)
  const today = dayStart()

  const [todays, recent, total, byCategory] = await Promise.all([
    prisma.highlight.findMany({ where: { userId, entryDate: today }, orderBy: { createdAt: 'desc' } }),
    prisma.highlight.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 }),
    prisma.highlight.count({ where: { userId } }),
    prisma.highlight.groupBy({ by: ['category'], where: { userId }, _count: { id: true } }),
  ])

  const categoryCounts: Record<string, number> = {}
  for (const row of byCategory) categoryCounts[row.category] = row._count.id

  return { profile, todays, recent, total, categoryCounts, loggedToday: todays.length > 0 }
}
