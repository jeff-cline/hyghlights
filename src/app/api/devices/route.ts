import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { revokeDevice, revokeOtherDevices } from '@/lib/devices'

// Sign a device out. Takes effect on that browser's very next request, because
// every session revalidates its Device row — which is the whole reason a
// ninety-day session is a responsible thing to offer.

const schema = z.union([
  z.object({ action: z.literal('revoke'), deviceId: z.string().min(1).max(64) }),
  z.object({ action: z.literal('revokeOthers') }),
])

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })

  if (parsed.data.action === 'revokeOthers') {
    // Keeps the browser making the request. Signing yourself out while trying
    // to secure your account is a hostile way to answer a good instinct.
    const n = await revokeOtherDevices(session.userId, session.deviceId ?? '')
    return NextResponse.json({ ok: true, revoked: n })
  }

  const ok = await revokeDevice(session.userId, parsed.data.deviceId)
  if (!ok) return NextResponse.json({ error: 'That device was not found.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
