import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { joinByCode } from '@/lib/groups'

const schema = z.object({ code: z.string().min(4).max(12) })

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Enter an invite code.' }, { status: 400 })
  const group = await joinByCode(user.userId, user.email, parsed.data.code)
  if (!group) return NextResponse.json({ error: 'No circle with that code.' }, { status: 404 })
  return NextResponse.json({ group: { id: group.id } })
}
