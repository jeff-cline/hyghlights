import { NextResponse } from 'next/server'
import { findIdentity } from '@/lib/identity'
import { signReset } from '@/lib/reset-token'
import { coreEmail } from '@/lib/core-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// "I forgot my password."
//
// Looks the address up in the SHARED account store, so somebody who made their
// account on Beyond Limits can recover it from here — which is the promise the
// login screen already makes when it says the Beyond Limits login works here.
//
// The response is the same whether or not the address is registered. Telling a
// stranger which addresses have accounts is a free list of who to go after.

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string }
  const email = String(body.email || '').trim().toLowerCase()

  if (email) {
    const identity = await findIdentity(email).catch(() => null)
    if (identity && identity.isActive) {
      const base = process.env.NEXTAUTH_URL || 'https://hyghlights.com'
      const link = `${base}/reset?token=${encodeURIComponent(signReset(email))}`
      await coreEmail(
        email,
        'Reset your hYghlights password',
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:520px">
           <h2 style="margin:0 0 6px;font-weight:900;letter-spacing:-.02em"><span style="color:#000">h</span><span style="color:#e07800;font-weight:900">Y</span><span style="color:#000">ghlights</span></h2>
           <h3 style="color:#0D9488;margin:18px 0 8px">Choose a new password</h3>
           <p style="line-height:1.55">Tap the button below to set a new password. The link works for one hour.</p>
           <p style="margin:22px 0">
             <a href="${link}" style="background:#0D9488;color:#fff;padding:13px 24px;border-radius:100px;text-decoration:none;font-weight:700;display:inline-block">Reset my password</a>
           </p>
           <p style="line-height:1.55">This is the same password you use on Beyond Limits Bootcamp — changing it here changes it in both places.</p>
           <p style="color:#888;font-size:12px;line-height:1.5">If you did not ask for this, nothing has changed and you can ignore this email.</p>
         </div>`,
      )
    }
  }

  return NextResponse.json({ ok: true })
}
