import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { setHighlightShareable } from '@/lib/card-data'

// Tick one of your own wins for your public card.
//
// Per-highlight and opt-in. Everything in this community was written inside a
// members-only room, so nothing reaches a card without its author saying so
// about that specific win.

const schema = z.object({
  highlightId: z.string().min(1).max(64),
  shareable: z.boolean(),
})

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })

  // setHighlightShareable scopes by userId in the same statement, so this can
  // only ever reach a highlight the caller wrote. A miss and a stranger's id are
  // the same answer.
  const ok = await setHighlightShareable(
    user.userId, parsed.data.highlightId, parsed.data.shareable,
  )
  if (!ok) return NextResponse.json({ error: 'That win could not be updated.' }, { status: 404 })

  return NextResponse.json({ ok: true, shareable: parsed.data.shareable })
}
