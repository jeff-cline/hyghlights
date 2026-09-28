import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { deleteHighlight } from '@/lib/comments'
import { addHighlight } from '@/lib/highlights'
import { prisma } from '@/lib/db'
import { CATEGORIES } from '@/lib/categories'

const KEYS = CATEGORIES.map((c) => c.key) as [string, ...string[]]

const bodySchema = z.object({
  category: z.enum(KEYS),
  text: z.string().min(1).max(4000),
  photoUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
})

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Pick a category and write your hYghlight.' }, { status: 400 })
  }

  const result = await addHighlight(user.userId, user.email, parsed.data)
  return NextResponse.json({
    highlight: result.highlight,
    currentStreak: result.currentStreak,
    longestStreak: result.longestStreak,
    extended: result.extended,
  })
}

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const highlights = await prisma.highlight.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ highlights })
}

/**
 * Delete one of your own wins.
 *
 * Posting the wrong thing, or posting somewhere you did not mean to, is an
 * ordinary mistake and until now there was no way back from it. Scoped to the
 * caller's own posts in the query itself.
 */
export async function DELETE(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const body = (await req.json().catch(() => null)) as { highlightId?: unknown } | null
  const id = String(body?.highlightId ?? '').trim()
  if (!id || id.length > 64) {
    return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
  }

  const ok = await deleteHighlight(id, user.userId)
  if (!ok) return NextResponse.json({ error: 'That win could not be removed.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
