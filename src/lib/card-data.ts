import 'server-only'
import { prisma } from './db'
import { slugCandidates, isValidSlug } from './card'

// Reading and writing the public card.
//
// Every query here is written so that "not public" and "does not exist" are the
// same answer. A 404 for a card that is switched off is the point: whether an
// address belongs to a member is itself private on an invite-only site, and a
// "this member has made their card private" page would confirm it.

export type PublicCard = {
  slug: string
  displayName: string
  why: string | null
  peacePlace: string | null
  currentStreak: number
  longestStreak: number
  totalWins: number
  memberSince: Date
  wins: { id: string; text: string; category: string; createdAt: Date }[]
}

/** How many shared wins a card shows. Enough to be real, not a whole feed. */
const MAX_CARD_WINS = 12

/**
 * Load a card by slug, or null.
 *
 * Returns null for a missing slug, a malformed one, and a card whose owner has
 * not turned it on — deliberately indistinguishable to the caller.
 */
export async function getPublicCard(slug: string): Promise<PublicCard | null> {
  if (!isValidSlug(slug)) return null

  const profile = await prisma.profile
    .findFirst({
      where: { cardSlug: slug, cardPublic: true },
      select: {
        userId: true, displayName: true, why: true, peacePlace: true,
        currentStreak: true, longestStreak: true, createdAt: true, cardSlug: true,
      },
    })
    .catch(() => null)
  if (!profile || !profile.cardSlug) return null

  const [wins, totalWins] = await Promise.all([
    prisma.highlight.findMany({
      where: { userId: profile.userId, isShareable: true },
      orderBy: { createdAt: 'desc' },
      take: MAX_CARD_WINS,
      // Only what the card renders. Notably not email, and not photo or video:
      // a member ticking "share this win" is agreeing to the words, and an
      // image of themselves is a separate decision we have not asked them for.
      select: { id: true, text: true, category: true, createdAt: true },
    }).catch(() => []),
    prisma.highlight.count({ where: { userId: profile.userId } }).catch(() => 0),
  ])

  return {
    slug: profile.cardSlug,
    // Never fall back to the email local-part — that leaks an address.
    displayName: profile.displayName?.trim() || 'A hYghlights member',
    why: profile.why?.trim() || null,
    peacePlace: profile.peacePlace?.trim() || null,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    totalWins,
    memberSince: profile.createdAt,
    wins,
  }
}

/**
 * Give this member a slug, if they do not have one.
 *
 * Issued once and then left alone: a slug that followed a display-name edit
 * would quietly break every link the member had already shared. Walks the
 * numbered candidates and takes the first free one, relying on the unique
 * constraint rather than a read-then-write — two people pressing the button at
 * the same moment would otherwise both be handed the same slug.
 */
export async function ensureCardSlug(
  userId: string, displayName: string | null,
): Promise<string | null> {
  const existing = await prisma.profile
    .findUnique({ where: { userId }, select: { cardSlug: true } })
    .catch(() => null)
  if (existing?.cardSlug) return existing.cardSlug

  const candidates = slugCandidates(displayName)
  if (candidates.length === 0) return null

  for (const slug of candidates) {
    try {
      await prisma.profile.update({ where: { userId }, data: { cardSlug: slug } })
      return slug
    } catch {
      // Unique violation: somebody holds it. Try the next number.
      continue
    }
  }
  return null
}

/** Turn the card on or off. Turning it on issues a slug if there is not one. */
export async function setCardPublic(
  userId: string, isPublic: boolean, displayName: string | null,
): Promise<{ ok: boolean; slug: string | null }> {
  let slug: string | null = null
  if (isPublic) {
    slug = await ensureCardSlug(userId, displayName)
    // No usable name means no slug, and a card with no address cannot be
    // served. Refused rather than switched on into nothing.
    if (!slug) return { ok: false, slug: null }
  } else {
    const p = await prisma.profile
      .findUnique({ where: { userId }, select: { cardSlug: true } })
      .catch(() => null)
    slug = p?.cardSlug ?? null
  }

  try {
    await prisma.profile.update({ where: { userId }, data: { cardPublic: isPublic } })
  } catch {
    return { ok: false, slug }
  }
  return { ok: true, slug }
}

/** Tick or untick one of the member's own wins for their card. */
export async function setHighlightShareable(
  userId: string, highlightId: string, shareable: boolean,
): Promise<boolean> {
  // Scoped by userId in the same statement, so this can only ever reach a
  // highlight the caller wrote.
  const r = await prisma.highlight
    .updateMany({ where: { id: highlightId, userId }, data: { isShareable: shareable } })
    .catch(() => ({ count: 0 }))
  return r.count > 0
}
