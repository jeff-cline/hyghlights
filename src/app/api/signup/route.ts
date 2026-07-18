import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findIdentity, createIdentity } from '@/lib/identity'

const schema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
  password: z.string().min(8, 'Use at least 8 characters.'),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 })
  }
  const { email, name, password } = parsed.data

  const existing = await findIdentity(email)
  if (existing) {
    return NextResponse.json({ error: 'That email already has an account — just sign in.' }, { status: 409 })
  }

  await createIdentity(email, name ?? null, password)
  return NextResponse.json({ ok: true })
}
