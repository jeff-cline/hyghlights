import 'server-only'
import { coreEmail } from './core-email'

/**
 * Send somebody a member's card by email.
 *
 * The invite-only door, made actually usable. Social sharing only reaches
 * people who follow you somewhere public; the person most likely to join
 * because you asked is usually someone you would email, not broadcast to.
 */
export async function sendCardInvite(opts: {
  toEmail: string
  fromName: string
  cardUrl: string
  note?: string | null
}): Promise<boolean> {
  const note = String(opts.note ?? '').trim().slice(0, 500)

  return coreEmail(
    opts.toEmail,
    `${opts.fromName} shared their hYghlights card with you`,
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:520px">
       <h2 style="margin:0 0 6px;font-weight:900;letter-spacing:-.02em"><span style="color:#000">h</span><span style="color:#e07800;font-weight:900">Y</span><span style="color:#000">ghlights</span></h2>
       <h3 style="color:#0D9488;margin:18px 0 8px">${escapeHtml(opts.fromName)} invited you</h3>
       <p style="line-height:1.55">
         &ldquo;I&rsquo;m celebrating wins with hYghlights. Please follow my journey.&rdquo;
       </p>
       ${note ? `<blockquote style="margin:16px 0;padding:14px 18px;background:#F6F8FA;border-left:4px solid #34c5c5;line-height:1.55;color:#333">${escapeHtml(note)}</blockquote>` : ''}
       <p style="margin:22px 0">
         <a href="${opts.cardUrl}" style="background:#0D9488;color:#fff;padding:13px 24px;border-radius:100px;text-decoration:none;font-weight:700;display:inline-block">See their card</a>
       </p>
       <p style="line-height:1.55;color:#555">
         hYghlights is a private, invite-only community for people on a journey to
         make the world better &mdash; love, peace, patience, kindness, brightness,
         and no doom. There are enough places for that.
       </p>
       <p style="color:#888;font-size:12px;line-height:1.5">
         You received this because ${escapeHtml(opts.fromName)} chose to send it to you.
         We will not email you again unless you join.
       </p>
     </div>`,
  )
}

/** A member's name and note go into an HTML email, so both are escaped. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
