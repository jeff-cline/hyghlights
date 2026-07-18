import { prisma } from '@/lib/db'

export const REACTIONS = [
  { type: 'HIGHFIVE', emoji: '🙌', label: 'High-five' },
  { type: 'BALLOON', emoji: '🎈', label: 'Balloon' },
  { type: 'DANCEPARTY', emoji: '🕺', label: 'Dance party' },
] as const

export type ReactionType = (typeof REACTIONS)[number]['type']
export const REACTION_TYPES = REACTIONS.map((r) => r.type) as ReactionType[]

export type FeedItem = {
  id: string
  author: string
  isMine: boolean
  category: string
  text: string
  createdAt: string
  counts: Record<ReactionType, number>
  mine: ReactionType[]
}

function nameFromEmail(email: string) {
  return email.split('@')[0]
}

// Recent highlights across the community, with reaction tallies + which ones
// the current member gave. This is the shared "wins wall" surfaced both here
// and inside the Beyond Limits Community tab.
export async function getCommunityFeed(currentUserId: string, limit = 50): Promise<FeedItem[]> {
  const highlights = await prisma.highlight.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { reactions: true },
  })
  const userIds = [...new Set(highlights.map((h) => h.userId))]
  const profiles = await prisma.profile.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, displayName: true, email: true },
  })
  const nameByUser: Record<string, string> = {}
  for (const p of profiles) nameByUser[p.userId] = p.displayName || nameFromEmail(p.email)

  return highlights.map((h) => {
    const counts = { HIGHFIVE: 0, BALLOON: 0, DANCEPARTY: 0 } as Record<ReactionType, number>
    const mine: ReactionType[] = []
    for (const r of h.reactions) {
      const t = r.type as ReactionType
      if (counts[t] === undefined) continue
      counts[t]++
      if (r.fromUserId === currentUserId) mine.push(t)
    }
    return {
      id: h.id,
      author: nameByUser[h.userId] ?? nameFromEmail(h.email),
      isMine: h.userId === currentUserId,
      category: h.category,
      text: h.text,
      createdAt: h.createdAt.toISOString(),
      counts,
      mine,
    }
  })
}

// Toggle a reaction (high-five / balloon / dance party). Returns the new state.
export async function toggleReaction(
  userId: string,
  email: string,
  highlightId: string,
  type: ReactionType,
): Promise<{ on: boolean }> {
  const existing = await prisma.reaction.findUnique({
    where: { highlightId_fromUserId_type: { highlightId, fromUserId: userId, type } },
  })
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } })
    return { on: false }
  }
  await prisma.reaction.create({ data: { highlightId, fromUserId: userId, fromEmail: email, type } })
  return { on: true }
}
