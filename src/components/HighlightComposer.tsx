'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/lib/categories'

function Celebration({ song }: { song?: string | null }) {
  const balloons = ['🎈', '🎉', '🙌', '💃', '💛', '🌹', '🔥', '✨', '🥳', '💪']
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
      {song && <iframe title="celebration" className="absolute w-0 h-0" src={toEmbed(song)} allow="autoplay" />}
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
  const fileInput = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState(CATEGORIES[0].key)
  const [text, setText] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    setUploading(false)
    const b = await res.json().catch(() => ({}))
    if (!res.ok) return setError(b.error ?? 'Upload failed.')
    if (b.kind === 'video') { setVideoUrl(b.url); setPhotoUrl(null) }
    else { setPhotoUrl(b.url); setVideoUrl(null) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, text: text.trim(), photoUrl, videoUrl }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const b = await res.json().catch(() => ({}))
      setError(b.error ?? 'Could not save your HYghLight.')
      return
    }
    setText('')
    setPhotoUrl(null)
    setVideoUrl(null)
    setCelebrate(true)
    setTimeout(() => { setCelebrate(false); router.refresh() }, 2200)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm hy-rise">
      <h2 className="text-xl md:text-2xl font-black text-gray-800 mb-1">What were your HYghLights today?</h2>
      <p className="text-gray-500 text-sm mb-5">
        {loggedToday ? 'Add another — every win counts.' : 'Capture a win, a memory, or a moment you want to remember.'}
      </p>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 mb-4">{error}</div>
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

        {/* Media preview */}
        {(photoUrl || videoUrl) && (
          <div className="mt-3 relative inline-block">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="attachment" className="max-h-40 rounded-2xl border border-gray-100" />
            )}
            {videoUrl && <video src={videoUrl} className="max-h-40 rounded-2xl border border-gray-100" controls />}
            <button
              type="button"
              onClick={() => { setPhotoUrl(null); setVideoUrl(null) }}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full w-6 h-6 text-gray-500 shadow"
            >
              ×
            </button>
          </div>
        )}

        <input ref={fileInput} type="file" accept="image/*,video/*" className="hidden" onChange={onFile} />

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="text-sm font-bold text-[#0D9488] hover:text-[#e07800] disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : '📷 Add photo / video'}
          </button>
          <button
            type="submit"
            disabled={submitting || uploading || !text.trim()}
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
