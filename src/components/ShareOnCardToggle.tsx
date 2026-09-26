'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Tick one of your own wins for your public card.
 *
 * Only rendered for the author's own highlights. Which wins somebody has chosen
 * to show the world is not information other members need about them.
 *
 * Optimistic, then corrected: the tick is the kind of thing people click while
 * scrolling, and waiting on a round-trip to show it makes the control feel
 * broken. A failure puts it back and says so.
 */
export default function ShareOnCardToggle({
  highlightId, initial, cardPublic,
}: {
  highlightId: string
  initial: boolean
  /** When the card itself is off, ticking a win does nothing visible yet. */
  cardPublic: boolean
}) {
  const [on, setOn] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function toggle() {
    const next = !on
    setOn(next); setBusy(true); setFailed(false)
    try {
      const res = await fetch('/api/highlights/shareable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId, shareable: next }),
      })
      if (!res.ok) { setOn(!next); setFailed(true) }
    } catch {
      setOn(!next); setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button type="button" onClick={toggle} disabled={busy} aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                on
                  ? 'bg-[#0D9488]/10 text-[#0D9488] ring-1 ring-[#0D9488]/30'
                  : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200 hover:bg-gray-100'
              } disabled:opacity-60`}>
        <span aria-hidden="true">{on ? '✓' : '＋'}</span>
        {on ? 'On my card' : 'Show on my card'}
      </button>

      {/* Ticking a win while the card is off is a reasonable thing to do — it
          just has no effect yet, and saying so beats letting them wonder. */}
      {on && !cardPublic && (
        <span className="text-xs text-gray-500">
          Your card is off —{' '}
          <Link href="/settings" className="font-bold text-[#0D9488] hover:underline">
            turn it on
          </Link>
        </span>
      )}

      {failed && <span className="text-xs font-semibold text-red-600">Did not save</span>}
    </div>
  )
}
