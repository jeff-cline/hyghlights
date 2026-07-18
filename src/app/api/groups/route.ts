import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { createGroup } from '@/lib/groups'

const schema = z.object({ name: z.string().min(1).max(80) })

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Name your circle.' }, { status: 400 })
  const group = await createGroup(user.userId, user.email, parsed.data.name)
  return NextResponse.json({ group: { id: group.id, inviteCode: group.inviteCode } })
}
