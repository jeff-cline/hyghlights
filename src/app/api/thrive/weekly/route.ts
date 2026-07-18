import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { saveWeekly } from '@/lib/weekly'

const schema = z.object({
  scores: z.record(z.string(), z.number()),
  note: z.string().max(2000).optional().nullable(),
})

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Score each area 0–10.' }, { status: 400 })
  await saveWeekly(user.userId, user.email, parsed.data.scores, parsed.data.note)
  return NextResponse.json({ ok: true })
}
