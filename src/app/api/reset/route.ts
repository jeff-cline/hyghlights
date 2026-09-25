import { NextResponse } from 'next/server'
import { verifyReset } from '@/lib/reset-token'
import { setIdentityPassword } from '@/lib/identity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Set the new password.
//
// Writes to the shared `User` row, so the new password works on Beyond Limits
// the moment it is saved here. There is one account and one password; a reset
// that only fixed one of the two sites would be worse than no reset at all,
// because it would leave somebody believing the systems are separate.

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { token?: string; password?: string }

  const claim = verifyReset(String(b.token || ''))
  if (!claim) {
    return NextResponse.json(
      { error: 'That link has expired or is not valid. Ask for a new one.' },
      { status: 400 },
    )
  }

  const password = String(b.password || '')
  if (password.length < 8) {
    return NextResponse.json({ error: 'Use at least 8 characters.' }, { status: 400 })
  }

  const done = await setIdentityPassword(claim.email, password).catch(() => false)
  if (!done) {
    return NextResponse.json(
      { error: 'We could not update that account. Get in touch and we will sort it out.' },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true, email: claim.email })
}
