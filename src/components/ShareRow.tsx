'use client'

import { useState } from 'react'
import { SHARE_TARGETS } from '@/lib/card'

/**
 * Share this card onward.
 *
 * Plain web-intent links rather than any network's SDK: a share button that
 * loads Facebook's script gives Facebook a record of everyone who merely *looked*
 * at a member's card. A link that opens a compose window does the same job and
 * reports nothing back.
 *
 * The native share sheet is offered first where the browser has one, because on
 * a phone it is both fewer taps and the only route to the apps people actually
 * use. It is feature-detected, not sniffed.
 */
export default function ShareRow({
  url, text, slug, canEmail,
}: {
  url: string
  text: string
  slug: string
  /** Only signed-in members may send mail from here — see the invite route. */
  canEmail: boolean
}) {
  const [invite, setInvite] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard refused (insecure context, or permission). Say so rather than
      // leaving a button that looks like it worked.
      window.prompt('Copy this link:', url)
    }
  }

  async function nativeShare() {
    setBusy(true)
    try {
      await navigator.share({ title: 'hYghlights', text, url })
    } catch {
      // Includes the user simply cancelling the sheet, which is not an error.
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-center text-sm font-black uppercase tracking-widest text-gray-400">
        Share this card
      </h2>

      {canNativeShare && (
        <button type="button" onClick={nativeShare} disabled={busy}
                className="mt-4 w-full rounded-full bg-[#0D9488] px-6 py-3 font-black text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60">
          Share…
        </button>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {SHARE_TARGETS.map((t) => {
          const href = t.href(url, text)
          if (href === null) {
            return (
              <button key={t.key} type="button" onClick={copy}
                      className="rounded-full bg-[#F6F8FA] px-4 py-2 text-sm font-bold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100">
                {copied ? 'Copied ✓' : t.label}
              </button>
            )
          }
          return (
            <a key={t.key} href={href} target="_blank" rel="noopener noreferrer"
               className="rounded-full bg-[#F6F8FA] px-4 py-2 text-sm font-bold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100">
              {t.label}
            </a>
          )
        })}
      </div>

      {/* Email it directly. Social sharing only reaches people who already
          follow you somewhere public; the person most likely to join because
          you asked is usually one you would email. */}
      {canEmail && (
        <form
          className="mt-5 border-t border-gray-100 pt-5"
          onSubmit={async (e) => {
            e.preventDefault()
            setSending(true); setInviteError(null); setSent(null)
            try {
              const res = await fetch('/api/card/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, toEmail: invite }),
              })
              const b = await res.json().catch(() => ({}))
              if (!res.ok) { setInviteError(b.error ?? 'That could not be sent.'); return }
              setSent(invite); setInvite('')
            } catch {
              setInviteError('That could not be sent.')
            } finally {
              setSending(false)
            }
          }}
        >
          <label htmlFor="invite" className="block text-center text-sm font-bold text-gray-700">
            Or send it to someone by email
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              id="invite" type="email" required value={invite}
              onChange={(e) => setInvite(e.target.value)}
              placeholder="their@email.com"
              className="min-w-[200px] flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#34c5c5]"
            />
            <button type="submit" disabled={sending || !invite}
                    className="shrink-0 rounded-xl bg-[#0D9488] px-6 py-3 font-black text-white transition-transform hover:scale-[1.02] disabled:opacity-60">
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
          {sent && (
            <p className="mt-2 text-center text-sm font-bold text-[#0D9488]">
              Sent to {sent} ✓
            </p>
          )}
          {inviteError && (
            <p className="mt-2 text-center text-sm font-semibold text-red-600">{inviteError}</p>
          )}
        </form>
      )}
    </section>
  )
}
