'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cardPath, cardUrl } from '@/lib/card'

export default function SettingsForm({
  initial,
}: {
  initial: {
    displayName: string; peacePlace: string; celebrationSong: string
    why: string; cardPublic: boolean; cardSlug: string | null
  }
}) {
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [peacePlace, setPeacePlace] = useState(initial.peacePlace)
  const [celebrationSong, setCelebrationSong] = useState(initial.celebrationSong)
  const [why, setWhy] = useState(initial.why)
  const [cardPublic, setCardPublic] = useState(initial.cardPublic)
  const [cardSlug, setCardSlug] = useState(initial.cardSlug)
  const [cardError, setCardError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  /**
   * The card toggle saves on its own, immediately.
   *
   * Making somebody press Save to publish or unpublish a page is the wrong
   * shape: switching it OFF must take effect the moment they decide, not when
   * they remember to submit the form.
   */
  async function toggleCard(next: boolean) {
    setCardError(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, cardPublic: next }),
    })
    const b = await res.json().catch(() => ({}))
    if (!res.ok) { setCardError(b.error ?? 'That could not be saved.'); return }
    setCardPublic(next)
    setCardSlug(b?.profile?.cardSlug ?? cardSlug)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, peacePlace, celebrationSong, why }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const field =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent'

  return (
    <form onSubmit={save} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Display name</label>
        <input className={field} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="What should we call you?" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Your peace place</label>
        <p className="text-gray-500 text-xs mb-2">Where you sit and reflect — the ocean, the lake, a bonfire, a closet. Just for you.</p>
        <input className={field} value={peacePlace} onChange={(e) => setPeacePlace(e.target.value)} placeholder="e.g. the beach at sunrise" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Celebration song 🎵</label>
        <p className="text-gray-500 text-xs mb-2">A YouTube link that plays when you celebrate a win.</p>
        <input className={field} value={celebrationSong} onChange={(e) => setCelebrationSong(e.target.value)} placeholder="https://youtu.be/…" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">
          Your why
        </label>
        <p className="text-gray-500 text-xs mb-2">
          The Y in hYghlights is <strong>why</strong>. Why are you doing this? It is the
          first thing anyone sees on your card.
        </p>
        <input className={field} value={why} onChange={(e) => setWhy(e.target.value)}
               maxLength={280}
               placeholder="e.g. To be the reason someone keeps going" />
      </div>

      {/* ── the public card ──────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#F6F8FA] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-black text-gray-800">Your card</p>
            <p className="mt-1 text-xs text-gray-500">
              The one page here that anybody can see. Everything else stays
              members-only. Off until you turn it on.
            </p>
          </div>
          <button type="button" role="switch" aria-checked={cardPublic}
                  onClick={() => toggleCard(!cardPublic)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    cardPublic ? 'bg-[#0D9488]' : 'bg-gray-300'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
              cardPublic ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {cardError && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {cardError}
          </p>
        )}

        {cardPublic && cardSlug && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs font-bold text-gray-500">Your link</p>
            <p className="mt-1 break-all font-mono text-sm text-[#0D9488]">
              {cardUrl(cardSlug)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={cardPath(cardSlug)} target="_blank"
                    className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0D9488] ring-1 ring-gray-200 hover:bg-gray-50">
                See exactly what others see →
              </Link>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Your card shows your name, your why and your streak. It shows a win only
              if you have ticked that win as shareable — nothing you have written
              appears here otherwise.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-7 py-3 rounded-full hover:scale-[1.02] transition-transform disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-[#0D9488] font-bold text-sm">Saved ✓</span>}
      </div>
    </form>
  )
}
