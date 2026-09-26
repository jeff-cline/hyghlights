import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { getPublicCard } from '@/lib/card-data'
import { cardUrl } from '@/lib/card'
import { sendCardInvite } from '@/lib/card-invite-email'

// Email somebody a card.
//
// SIGNED-IN ONLY, and that is the whole security design: an endpoint that sends
// mail to any address a stranger types is a spam relay wearing a product's
// clothes. A member sending an invitation is the intended use and is
// attributable; an anonymous visitor doing it is not.

const schema = z.object({
  slug: z.string().min(1).max(64),
  toEmail: z.string().email(),
  note: z.string().max(500).optional().nullable(),
})

/** Modest, and per member: an invitation is a considered act, not a campaign. */
const MAX_PER_DAY = 25

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Sign in to send a card.' }, { status: 401 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  // The card must exist AND be public. Emailing a link to a card that is
  // switched off would send somebody to a 404, and would also quietly reveal
  // that a private card exists.
  const card = await getPublicCard(parsed.data.slug)
  if (!card) return NextResponse.json({ error: 'That card is not available.' }, { status: 404 })

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const sentToday = await prisma.cardInvite
    .count({ where: { fromUserId: session.userId, createdAt: { gte: since } } })
    .catch(() => 0)
  if (sentToday >= MAX_PER_DAY) {
    return NextResponse.json(
      { error: 'That is a lot of invitations for one day. Try again tomorrow.' },
      { status: 429 },
    )
  }

  const profile = await prisma.profile
    .findUnique({ where: { userId: session.userId }, select: { displayName: true } })
    .catch(() => null)
  const fromName = profile?.displayName?.trim() || session.email.split('@')[0]

  const ok = await sendCardInvite({
    toEmail: parsed.data.toEmail,
    fromName,
    cardUrl: cardUrl(card.slug),
    note: parsed.data.note,
  })
  if (!ok) {
    return NextResponse.json({ error: 'That could not be sent. Try again.' }, { status: 502 })
  }

  // Recorded after the send, so a failed mail does not spend anybody's daily
  // allowance. The address is kept only to make the rate limit real.
  await prisma.cardInvite.create({
    data: { fromUserId: session.userId, slug: card.slug, toEmail: parsed.data.toEmail },
  }).catch(() => null)

  return NextResponse.json({ ok: true })
}
