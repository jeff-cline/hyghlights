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
export default function ShareRow({ url, text }: { url: string; text: string }) {
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
    </section>
  )
}
