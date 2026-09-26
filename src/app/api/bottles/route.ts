import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { sendBottle } from '@/lib/bottles'
import { notifyBottle } from '@/lib/bottle-email'
import { getOrCreateProfile } from '@/lib/highlights'

const schema = z.object({
  toEmail: z.string().email(),
  message: z.string().min(1).max(4000),
  photoUrl: z.string().url().optional().nullable(),
})

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Enter a friend’s email and a message. 🌊' }, { status: 400 })

  const profile = await getOrCreateProfile(user.userId, user.email)
  const fromName = profile.displayName ?? user.email.split('@')[0]

  await sendBottle({
    fromUserId: user.userId,
    fromEmail: user.email,
    fromName,
    toEmail: parsed.data.toEmail,
    message: parsed.data.message,
    photoUrl: parsed.data.photoUrl,
  })

  // Announce it. Bottles were stored and never mentioned to anybody, so one
  // sent to a person who was not already on the Ocean page simply sat unread.
  // Fire-and-forget: the bottle is already saved, and a slow mail server must
  // not turn a delivered message into an error on the sender's screen.
  notifyBottle({ toEmail: parsed.data.toEmail, fromName, message: parsed.data.message })
    .catch(() => {})

  return NextResponse.json({ ok: true })
}
