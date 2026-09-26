import 'server-only'
import { coreEmail } from './core-email'

/**
 * Tell somebody a bottle washed up for them.
 *
 * Bottles were being stored and never announced. Somebody sent one, the row was
 * written correctly, and the recipient had no way to learn it existed short of
 * happening to open the Ocean page — so a message sent to a person who was not
 * already looking simply sat there. The email is the whole difference between a
 * feature and a message that arrives.
 *
 * Never throws: a bottle that is saved but not announced is a bad day, a bottle
 * that fails to save because a mail server was slow is a worse one.
 */
export async function notifyBottle(opts: {
  toEmail: string
  fromName: string
  message: string
}): Promise<boolean> {
  // A taste, not the whole thing — opening it should still be worth doing, and
  // the full message lives behind a login for a reason.
  const preview = opts.message.trim().slice(0, 140)
  const trimmed = opts.message.trim().length > 140

  return coreEmail(
    opts.toEmail,
    `${opts.fromName} sent you a message in a bottle 🌊`,
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:520px">
       <h2 style="margin:0 0 6px;font-weight:900;letter-spacing:-.02em"><span style="color:#000">h</span><span style="color:#e07800;font-weight:900">Y</span><span style="color:#000">ghlights</span></h2>
       <h3 style="color:#0D9488;margin:18px 0 8px">A bottle washed up 🌊</h3>
       <p style="line-height:1.55"><strong>${escapeHtml(opts.fromName)}</strong> sent you a message.</p>
       <blockquote style="margin:16px 0;padding:14px 18px;background:#F6F8FA;border-left:4px solid #34c5c5;line-height:1.55;color:#333">
         ${escapeHtml(preview)}${trimmed ? '…' : ''}
       </blockquote>
       <p style="margin:22px 0">
         <a href="https://hyghlights.com/bottles" style="background:#0D9488;color:#fff;padding:13px 24px;border-radius:100px;text-decoration:none;font-weight:700;display:inline-block">Open your bottle</a>
       </p>
       <p style="color:#888;font-size:12px;line-height:1.5">
         Private, between the two of you. Nobody else on hYghlights can see it.
       </p>
     </div>`,
  )
}

/**
 * Somebody else's words are going into an HTML email, so they are escaped.
 * A bottle is free text typed by one member and delivered to another — exactly
 * the shape of thing that carries a tag through if nobody looks.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
