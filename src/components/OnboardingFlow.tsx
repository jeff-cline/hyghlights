'use client'

import { useState } from 'react'
import {
  PEACE_PLACES, MAX_PEACE_PLACES, formatPeacePlaces,
} from '@/lib/peace-places'

const ITHRIVE = [
  ['I', 'I Am Unstoppable', '💪'],
  ['T', 'Track Every Victory', '🔥'],
  ['H', 'Honor Your Progress', '🙏'],
  ['R', 'Recognize Your Wins', '✨'],
  ['I', 'Ignite Your Purpose', '🚀'],
  ['V', 'Visualize Victory', '🏰'],
  ['E', 'Execute with Excellence', '🌹'],
]


export default function OnboardingFlow({ initialName }: { initialName: string }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(initialName)
  // A list now. One peace place was never really true — morning coffee and the
  // drive home are both somewhere you reflect, and making people rank them
  // just loses the information.
  const [places, setPlaces] = useState<string[]>([])
  const [customPlace, setCustomPlace] = useState('')
  const [song, setSong] = useState('')
  const [saving, setSaving] = useState(false)

  const field =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent'
  const primary =
    'inline-flex items-center gap-2 bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50'

  async function finish() {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: name.trim() || undefined,
        peacePlace: formatPeacePlaces([...places, customPlace]) || undefined,
        celebrationSong: song.trim() || undefined,
        markOnboarded: true,
      }),
    })
    window.location.assign('/home')
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 md:p-10 hy-rise">
      {step === 0 && (
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Welcome to HYghLights</h1>
          <p className="text-gray-500 mb-6">Your daily ritual to be seen, tracked, and celebrated. Here&apos;s the spine of it:</p>
          <div className="grid gap-2 text-left mb-8">
            {ITHRIVE.map(([l, phrase, emoji], i) => (
              <div key={i} className="flex items-center gap-4 bg-[#F6F8FA] rounded-xl px-4 py-2.5">
                <span className="text-xl font-black text-[#e07800] w-6 text-center">{l}</span>
                <span className="font-bold text-gray-800">{phrase}</span>
                <span className="ml-auto text-lg">{emoji}</span>
              </div>
            ))}
          </div>
          <button className={primary} onClick={() => setStep(1)}>Let&apos;s begin 🚀</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">What should we call you? 🌹</h2>
          <p className="text-gray-500 mb-5">The name you want to celebrate.</p>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
          <div className="flex justify-end mt-6">
            <button className={primary} onClick={() => setStep(2)}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Find your peace places 🧘</h2>
          <p className="text-gray-500 mb-1">
            Where you&apos;ll sit and reflect — a space to celebrate and honor, just for you. No one else.
          </p>
          <p className="mb-5 text-sm text-gray-400">
            Pick as many as ring true, up to {MAX_PEACE_PLACES}. Most people have a few.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {PEACE_PLACES.map((p) => {
              const on = places.includes(p.label)
              // Full is not the same as unavailable: what is already chosen must
              // stay clickable, or the only way out of five is a page reload.
              const blocked = !on && places.length >= MAX_PEACE_PLACES
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={on}
                  disabled={blocked}
                  onClick={() =>
                    setPlaces((cur) =>
                      cur.includes(p.label)
                        ? cur.filter((x) => x !== p.label)
                        : cur.length >= MAX_PEACE_PLACES ? cur : [...cur, p.label])
                  }
                  className={`relative rounded-2xl border px-3 py-5 text-center transition-colors ${
                    on
                      ? 'border-[#e07800] bg-[#E8A849]/10'
                      : blocked
                        ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-45'
                        : 'border-gray-200 bg-white hover:border-[#34c5c5]/40'
                  }`}
                >
                  {on && (
                    <span aria-hidden="true"
                          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e07800] text-xs font-black text-white">
                      ✓
                    </span>
                  )}
                  <div className="mb-1 text-3xl">{p.emoji}</div>
                  <div className="text-sm font-bold text-gray-700">{p.label}</div>
                </button>
              )
            })}
          </div>

          <p className="mt-4 text-sm font-bold text-gray-500" aria-live="polite">
            {places.length === 0
              ? `Choose up to ${MAX_PEACE_PLACES}`
              : places.length >= MAX_PEACE_PLACES
                ? `${places.length} of ${MAX_PEACE_PLACES} — that’s the lot. Tap one to swap it out.`
                : `${places.length} of ${MAX_PEACE_PLACES} chosen`}
          </p>

          <input className={`${field} mt-3`} value={customPlace}
                 onChange={(e) => setCustomPlace(e.target.value)}
                 placeholder="…or somewhere else that speaks to you" />
          <p className="mt-1.5 text-xs text-gray-400">
            Anything you type here counts as one of your {MAX_PEACE_PLACES}.
          </p>
          <div className="flex justify-end mt-6">
            <button className={primary} onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Your celebration song 🎵💃</h2>
          <p className="text-gray-500 mb-5">A YouTube link that plays when you celebrate a win. (Optional — add it now or later.)</p>
          <input className={field} value={song} onChange={(e) => setSong(e.target.value)} placeholder="https://youtu.be/…" />
          <div className="flex justify-end mt-6">
            <button className={primary} onClick={() => setStep(4)}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center">
          <div className="text-5xl mb-4">🎉💃</div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">You&apos;re ready, {name.split(' ')[0] || 'friend'}!</h2>
          <p className="text-gray-500 mb-8">
            Every day, capture your HYghLights. Live a life you don&apos;t need to vacation from. 🏝️
          </p>
          <button className={primary} onClick={finish} disabled={saving}>
            {saving ? 'Entering…' : 'Enter HYghLights ✨'}
          </button>
        </div>
      )}
    </div>
  )
}
