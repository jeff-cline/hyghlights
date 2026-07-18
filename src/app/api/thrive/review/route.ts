import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { saveReview } from '@/lib/thrive'

const schema = z.object({
  period: z.enum(['weekly', 'monthly', 'quarterly', 'annual', 'adhoc']).default('adhoc'),
  scores: z.record(z.string(), z.number()),
  note: z.string().max(2000).optional().nullable(),
})

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Score each pillar 0–10.' }, { status: 400 })
  await saveReview(user.userId, user.email, parsed.data.period, parsed.data.scores, parsed.data.note)
  return NextResponse.json({ ok: true })
}
