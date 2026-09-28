'use client'

import { useState } from 'react'
import type { CommentRow } from '@/lib/comments'

const WHEN = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Replies under a win.
 *
 * Collapsed to a count until asked for, because the feed is a wall of wins and
 * forty lines of encouragement under the first one buries the rest.
 */
export default function CommentThread({
  highlightId, initial,
}: {
  highlightId: string
  initial: CommentRow[]
}) {
  const [comments, setComments] = useState<CommentRow[]>(initial)
  const [open, setOpen] = useState(initial.length > 0 && initial.length <= 3)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId, text: body }),
      })
      const b = await res.json().catch(() => ({}))
      if (!res.ok) { setError(b.error ?? 'That did not send.'); return }
      setComments((c) => [...c, b.comment])
      setText('')
    } catch {
      setError('That did not send.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    const before = comments
    setComments((c) => c.filter((x) => x.id !== id))   // optimistic
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id }),
      })
      if (!res.ok) { setComments(before); setError('That could not be removed.') }
    } catch {
      setComments(before); setError('That could not be removed.')
    }
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
                className="text-sm font-bold text-[#0D9488] hover:underline">
          {comments.length === 0
            ? 'Say something kind'
            : `${comments.length} ${comments.length === 1 ? 'reply' : 'replies'}`}
        </button>
      ) : (
        <>
          {comments.length > 0 && (
            <ul className="space-y-2.5">
              {comments.map((c) => (
                <li key={c.id} className="rounded-2xl bg-[#F6F8FA] px-4 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm">
                      <span className="font-black text-gray-800">
                        {c.isMine ? 'You' : c.fromName}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        {WHEN.format(new Date(c.createdAt))}
                      </span>
                    </p>
                    {c.canRemove && (
                      <button type="button" onClick={() => remove(c.id)}
                              aria-label="Remove this reply"
                              className="shrink-0 text-xs font-bold text-gray-400 hover:text-red-600">
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">{c.text}</p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={send} className="mt-3 flex flex-wrap gap-2">
            <input
              value={text} onChange={(e) => setText(e.target.value)} maxLength={1000}
              placeholder="Cheer them on…"
              className="min-w-[180px] flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#34c5c5]"
            />
            <button type="submit" disabled={busy || !text.trim()}
                    className="shrink-0 rounded-xl bg-[#0D9488] px-5 py-2.5 text-sm font-black text-white disabled:opacity-50">
              {busy ? 'Sending…' : 'Reply'}
            </button>
          </form>
          {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
        </>
      )}
    </div>
  )
}
