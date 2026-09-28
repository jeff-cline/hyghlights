'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Remove one of your own wins.
 *
 * Two taps, not a browser confirm(): a modal dialog blocks the page and reads
 * as an error, and this is an ordinary correction rather than an emergency. The
 * second tap is still a real gate — deleting a win takes its replies with it.
 */
export default function DeleteHighlight({ highlightId }: { highlightId: string }) {
  const router = useRouter()
  const [arming, setArming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function remove() {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/highlights', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId }),
      })
      if (!res.ok) { setError('That could not be removed.'); setBusy(false); return }
      router.refresh()
    } catch {
      setError('That could not be removed.'); setBusy(false)
    }
  }

  if (error) return <span className="text-xs font-semibold text-red-600">{error}</span>

  return arming ? (
    <span className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Delete this win and its replies?</span>
      <button type="button" onClick={remove} disabled={busy}
              className="text-xs font-black text-red-600 hover:underline disabled:opacity-50">
        {busy ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button type="button" onClick={() => setArming(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-700">
        Keep
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setArming(true)}
            className="text-xs font-bold text-gray-400 hover:text-red-600">
      Delete
    </button>
  )
}
