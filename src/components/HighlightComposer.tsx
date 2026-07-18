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
        <iframe title="celebration" className="absolute w-0 h-0" src={toEmbed(song)} allow="autoplay" />
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
      setError(b.error ?? 'Could not save your HYghLight.')
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
    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hy-rise">
      <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-1">
        What were your HYghLights today?
      </h2>
      <p className="text-gray-500 text-sm mb-5">
        {loggedToday ? 'Add another — every win counts.' : 'Capture a win, a memory, or a moment you want to remember.'}
      </p>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 mb-4">
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
                  on
                    ? 'bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white border-transparent'
                    : 'bg-[#F4F1EC] text-gray-600 border-transparent hover:text-[#0D9488] hover:bg-[#34c5c5]/10'
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
          className="w-full rounded-2xl bg-[#F6F8FA] border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent resize-none"
        />

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-7 py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            {submitting ? 'Saving…' : 'Celebrate it 🎉'}
          </button>
        </div>
      </form>

      {celebrate && <Celebration song={celebrationSong} />}
    </div>
  )
}
