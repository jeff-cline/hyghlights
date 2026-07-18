import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { getOrCreateProfile } from '@/lib/highlights'
import { prisma } from '@/lib/db'

const patchSchema = z.object({
  displayName: z.string().max(120).optional(),
  peacePlace: z.string().max(280).optional(),
  celebrationSong: z.string().max(500).optional(),
  markOnboarded: z.boolean().optional(),
})

export async function PATCH(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })

  await getOrCreateProfile(user.userId, user.email)
  const { markOnboarded, ...fields } = parsed.data
  const profile = await prisma.profile.update({
    where: { userId: user.userId },
    data: { ...fields, ...(markOnboarded ? { onboardedAt: new Date() } : {}) },
  })
  return NextResponse.json({ profile })
}
