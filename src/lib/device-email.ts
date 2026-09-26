import 'server-only'
import { coreEmail } from './core-email'

/**
 * Tell somebody their account signed in somewhere new.
 *
 * The one notification worth sending on a ninety-day session: nobody watches
 * their device list, but everybody reads an email that says a browser they do
 * not recognise just signed in. It names what can be revoked and where.
 *
 * Deliberately vague about location — a coarse IP is all we hold, and
 * pretending to know a city from it would be a guess presented as a fact.
 */
export async function notifyNewDevice(
  email: string, label: string, ip: string | null,
): Promise<void> {
  const where = ip ? ` from ${ip}` : ''
  await coreEmail(
    email,
    'A new device signed in to hYghlights',
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:520px">
       <h2 style="margin:0 0 6px;font-weight:900;letter-spacing:-.02em"><span style="color:#000">h</span><span style="color:#e07800;font-weight:900">Y</span><span style="color:#000">ghlights</span></h2>
       <h3 style="color:#0D9488;margin:18px 0 8px">A new sign-in</h3>
       <p style="line-height:1.55">
         <strong>${label}</strong>${where} just signed in to your account. Sessions
         last 90 days on a browser you have used before.
       </p>
       <p style="line-height:1.55">
         If that was you, there is nothing to do. If it was not, change your
         password and sign that device out — both from your settings.
       </p>
       <p style="margin:22px 0">
         <a href="https://hyghlights.com/settings" style="background:#0D9488;color:#fff;padding:13px 24px;border-radius:100px;text-decoration:none;font-weight:700;display:inline-block">Review my devices</a>
       </p>
       <p style="color:#888;font-size:12px;line-height:1.5">
         Your password is shared with Beyond Limits Bootcamp — changing it changes both.
       </p>
     </div>`,
  )
}
