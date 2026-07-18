import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { leaveGroup } from '@/lib/groups'

const schema = z.object({ groupId: z.string().min(1) })

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid.' }, { status: 400 })
  await leaveGroup(user.userId, parsed.data.groupId)
  return NextResponse.json({ ok: true })
}
