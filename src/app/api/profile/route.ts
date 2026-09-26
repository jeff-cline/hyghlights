import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { getOrCreateProfile } from '@/lib/highlights'
import { prisma } from '@/lib/db'
import { setCardPublic } from '@/lib/card-data'

const patchSchema = z.object({
  displayName: z.string().max(120).optional(),
  peacePlace: z.string().max(280).optional(),
  celebrationSong: z.string().max(500).optional(),
  markOnboarded: z.boolean().optional(),
  /// Their why — the Y in hYghlights, and what their card leads with.
  why: z.string().max(280).optional(),
  /// Turning the public card on or off. Handled separately from the plain
  /// fields below because switching it on has to issue a slug, and can fail
  /// when there is no usable name to build one from.
  cardPublic: z.boolean().optional(),
})

export async function PATCH(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })

  await getOrCreateProfile(user.userId, user.email)
  const { markOnboarded, cardPublic, ...fields } = parsed.data

  const profile = await prisma.profile.update({
    where: { userId: user.userId },
    data: { ...fields, ...(markOnboarded ? { onboardedAt: new Date() } : {}) },
  })

  // The card toggle runs after the name is saved, so somebody who types their
  // name and switches the card on in one go gets a slug built from the name they
  // just entered rather than the one they had a moment ago.
  let cardSlug = profile.cardSlug
  if (cardPublic !== undefined) {
    const r = await setCardPublic(user.userId, cardPublic, profile.displayName)
    if (!r.ok && cardPublic) {
      return NextResponse.json(
        { error: 'Add your name first — your card link is built from it.' },
        { status: 400 },
      )
    }
    cardSlug = r.slug
    return NextResponse.json({ profile: { ...profile, cardPublic, cardSlug } })
  }

  return NextResponse.json({ profile })
}
