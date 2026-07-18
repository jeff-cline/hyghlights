import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
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
    return NextResponse.json({ error: 'Pick a category and write your HYghLight.' }, { status: 400 })
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
