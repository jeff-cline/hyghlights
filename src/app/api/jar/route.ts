import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/db'

const schema = z.object({ highlightId: z.string().min(1), inJar: z.boolean() })

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid.' }, { status: 400 })

  // Only the owner can move their own highlights.
  const result = await prisma.highlight.updateMany({
    where: { id: parsed.data.highlightId, userId: user.userId },
    data: { inJar: parsed.data.inJar },
  })
  if (result.count === 0) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
