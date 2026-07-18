'use client'

import { useState } from 'react'

export default function SettingsForm({
  initial,
}: {
  initial: { displayName: string; peacePlace: string; celebrationSong: string }
}) {
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [peacePlace, setPeacePlace] = useState(initial.peacePlace)
  const [celebrationSong, setCelebrationSong] = useState(initial.celebrationSong)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, peacePlace, celebrationSong }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const field =
    'w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent'

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-white/70 mb-1.5">Display name</label>
        <input className={field} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="What should we call you?" />
      </div>

      <div>
        <label className="block text-sm font-bold text-white/70 mb-1.5">Your peace place</label>
        <p className="text-white/40 text-xs mb-2">Where you sit and reflect — the ocean, the lake, a bonfire, a closet. Just for you.</p>
        <input className={field} value={peacePlace} onChange={(e) => setPeacePlace(e.target.value)} placeholder="e.g. the beach at sunrise" />
      </div>

      <div>
        <label className="block text-sm font-bold text-white/70 mb-1.5">Celebration song 🎵</label>
        <p className="text-white/40 text-xs mb-2">A YouTube link that plays when you celebrate a win.</p>
        <input className={field} value={celebrationSong} onChange={(e) => setCelebrationSong(e.target.value)} placeholder="https://youtu.be/…" />
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="bg-gradient-to-r from-[#C9A24B] to-[#b8860b] text-black font-black px-7 py-3 rounded-full hover:scale-[1.02] transition-transform disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-[#34c5c5] font-bold text-sm">Saved ✓</span>}
      </div>
    </form>
  )
}
