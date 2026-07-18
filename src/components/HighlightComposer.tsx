'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/lib/categories'

function Celebration({ song }: { song?: string | null }) {
  // A quick burst of balloons + (optional) the member's celebration song.
  const balloons = ['🎈', '🎉', '🙌', '⭐', '💛', '🎊', '🥳', '✨']
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-3xl"
          style={{
            left: `${(i * 37) % 100}%`,
            bottom: '-40px',
            animation: `hy-float ${1.6 + (i % 5) * 0.25}s ease-in forwards`,
            animationDelay: `${(i % 6) * 0.08}s`,
          }}
        >
          {balloons[i % balloons.length]}
        </span>
      ))}
      <style>{`@keyframes hy-float { to { transform: translateY(-110vh) rotate(20deg); opacity: 0; } }`}</style>
      {song && (
        <iframe
          title="celebration"
          className="absolute w-0 h-0"
          src={toEmbed(song)}
          allow="autoplay"
        />
      )}
    </div>
  )
}

function toEmbed(url: string): string {
  const m = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : url
}

export default function HighlightComposer({
  loggedToday,
  celebrationSong,
}: {
  loggedToday: boolean
  celebrationSong?: string | null
}) {
  const router = useRouter()
  const [category, setCategory] = useState(CATEGORIES[0].key)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, text: text.trim() }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const b = await res.json().catch(() => ({}))
      setError(b.error ?? 'Could not save your highlight.')
      return
    }
    setText('')
    setCelebrate(true)
    setTimeout(() => {
      setCelebrate(false)
      router.refresh()
    }, 2200)
  }

  return (
    <div className="bg-[#15151a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl hy-rise">
      <h2 className="text-xl md:text-2xl font-black text-white mb-1">
        What were your highlights today?
      </h2>
      <p className="text-white/50 text-sm mb-5">
        {loggedToday ? 'Add another — every win counts.' : 'Capture a win, a memory, or a moment you want to remember.'}
      </p>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((c) => {
            const on = category === c.key
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`text-sm font-bold rounded-full px-3 py-1.5 border transition-colors ${
                  on ? 'bg-[#C9A24B] text-black border-[#C9A24B]' : 'bg-black/30 text-white/60 border-white/10 hover:border-[#34c5c5]/50'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            )
          })}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Today I…"
          className="w-full rounded-2xl bg-black/40 border border-white/15 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent resize-none"
        />

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A24B] to-[#b8860b] text-black font-black px-7 py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            {submitting ? 'Saving…' : 'Celebrate it 🎉'}
          </button>
        </div>
      </form>

      {celebrate && <Celebration song={celebrationSong} />}
    </div>
  )
}
