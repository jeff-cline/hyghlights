import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { toggleReaction, REACTION_TYPES } from '@/lib/social'

const schema = z.object({
  highlightId: z.string().min(1),
  type: z.enum(REACTION_TYPES as [string, ...string[]]),
})

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid reaction.' }, { status: 400 })
  const result = await toggleReaction(user.userId, user.email, parsed.data.highlightId, parsed.data.type as never)
  return NextResponse.json(result)
}
