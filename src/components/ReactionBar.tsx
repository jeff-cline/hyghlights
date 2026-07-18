'use client'

import { useState } from 'react'

// Self-contained (no server imports) so it can be reused verbatim inside the
// Beyond Limits Community tab, pointed at that app's own proxy endpoint.
const REACTIONS = [
  { type: 'HIGHFIVE', emoji: '🙌', label: 'High-five' },
  { type: 'BALLOON', emoji: '🎈', label: 'Balloon' },
  { type: 'DANCEPARTY', emoji: '🕺', label: 'Dance party' },
] as const

type Counts = Record<string, number>

export default function ReactionBar({
  highlightId,
  counts,
  mine,
  endpoint = '/api/reactions',
}: {
  highlightId: string
  counts: Counts
  mine: string[]
  endpoint?: string
}) {
  const [state, setState] = useState(() => {
    const s: Record<string, { count: number; on: boolean }> = {}
    for (const r of REACTIONS) s[r.type] = { count: counts[r.type] ?? 0, on: mine.includes(r.type) }
    return s
  })

  async function toggle(type: string) {
    setState((prev) => ({
      ...prev,
      [type]: { count: prev[type].count + (prev[type].on ? -1 : 1), on: !prev[type].on },
    }))
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId, type }),
      })
    } catch {
      // revert on failure
      setState((prev) => ({
        ...prev,
        [type]: { count: prev[type].count + (prev[type].on ? -1 : 1), on: !prev[type].on },
      }))
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map((r) => {
        const st = state[r.type]
        return (
          <button
            key={r.type}
            type="button"
            onClick={() => toggle(r.type)}
            title={r.label}
            className={`text-sm font-bold rounded-full px-3 py-1.5 border transition-colors ${
              st.on
                ? 'bg-[#34c5c5]/15 border-[#34c5c5]/40 text-[#0D9488]'
                : 'bg-white border-gray-200 text-gray-500 hover:border-[#34c5c5]/40'
            }`}
          >
            {r.emoji}
            {st.count > 0 && <span className="ml-1">{st.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
