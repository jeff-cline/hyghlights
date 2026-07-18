'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Bottle = {
  id: string
  fromName: string | null
  fromEmail: string
  toEmail: string
  message: string
  photoUrl: string | null
  openedAt: string | null
  createdAt: string
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function Compose() {
  const router = useRouter()
  const [toEmail, setToEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!toEmail.trim() || !message.trim()) return
    setSending(true)
    setError(null)
    const res = await fetch('/api/bottles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail: toEmail.trim(), message: message.trim() }),
    })
    setSending(false)
    const b = await res.json().catch(() => ({}))
    if (!res.ok) return setError(b.error ?? 'Could not send.')
    setToEmail('')
    setMessage('')
    setSent(true)
    setTimeout(() => { setSent(false); router.refresh() }, 2600)
  }

  const field =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent'

  return (
    <div className="relative bg-gradient-to-br from-[#34c5c5]/15 via-white to-[#34c5c5]/5 border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8 overflow-hidden">
      <h2 className="text-xl font-black text-gray-800 mb-1">Send a message in a bottle 🌊</h2>
      <p className="text-gray-500 text-sm mb-5">
        Remind a friend of the bad-ass you see in them 🌹 — it drifts across the ocean to their shore.
      </p>
      {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 mb-4">{error}</div>}
      <form onSubmit={send} className="space-y-3">
        <input className={field} type="email" placeholder="Friend’s email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} />
        <textarea className={`${field} resize-none`} rows={3} placeholder="You are unstoppable 💪 Never forget…" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit" disabled={sending} className="inline-flex items-center gap-2 bg-gradient-to-r from-[#34c5c5] to-[#0D9488] text-white font-black px-7 py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50">
          {sending ? 'Setting adrift…' : 'Send into the ocean 🌊'}
        </button>
      </form>
      {sent && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center text-center">
          <div className="text-5xl animate-bounce">🍾</div>
          <p className="font-black text-[#0D9488] mt-2">Drifting to their shore… 🌊</p>
        </div>
      )}
    </div>
  )
}

function InboxBottle({ bottle }: { bottle: Bottle }) {
  const router = useRouter()
  const [opened, setOpened] = useState(!!bottle.openedAt)
  const [opening, setOpening] = useState(false)

  async function open() {
    setOpening(true)
    await fetch('/api/bottles/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bottle.id }),
    })
    setTimeout(() => { setOpened(true); setOpening(false); router.refresh() }, 700)
  }

  if (!opened) {
    return (
      <button
        type="button"
        onClick={open}
        className="w-full text-left bg-gradient-to-br from-[#34c5c5]/15 to-white border border-[#34c5c5]/30 rounded-2xl shadow-sm px-5 py-5 hover:scale-[1.01] transition-transform"
      >
        <div className={`text-4xl ${opening ? 'animate-spin' : 'animate-bounce'}`}>🍾</div>
        <p className="font-black text-gray-800 mt-2">A bottle washed up from {bottle.fromName || bottle.fromEmail.split('@')[0]} 🌊</p>
        <p className="text-[#0D9488] text-sm font-bold">{opening ? 'Uncorking…' : 'Tap to open ✨'}</p>
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-black text-gray-800">💌 {bottle.fromName || bottle.fromEmail.split('@')[0]}</span>
        <span className="text-gray-400 text-xs">· {fmt(bottle.createdAt)}</span>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap italic">“{bottle.message}”</p>
      {bottle.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bottle.photoUrl} alt="" loading="lazy" className="mt-3 max-h-60 rounded-2xl border border-gray-100" />
      )}
    </div>
  )
}

export default function BottleBeach({ inbox, sent }: { inbox: Bottle[]; sent: Bottle[] }) {
  return (
    <div className="space-y-10">
      <Compose />

      <section>
        <h3 className="text-gray-800 font-black mb-3">Washed up on your shore 🏝️</h3>
        {inbox.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center text-gray-500">
            No bottles yet — the tide will bring some in. 🌊
          </div>
        ) : (
          <div className="space-y-3">
            {inbox.map((b) => <InboxBottle key={b.id} bottle={b} />)}
          </div>
        )}
      </section>

      {sent.length > 0 && (
        <section>
          <h3 className="text-gray-800 font-black mb-3">Set adrift by you</h3>
          <div className="space-y-2">
            {sent.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-3">
                <span className="text-gray-600 text-sm truncate mr-3">🍾 To {b.toEmail}</span>
                <span className="text-xs font-bold shrink-0" style={{ color: b.openedAt ? '#0D9488' : '#e07800' }}>
                  {b.openedAt ? 'opened ✨' : 'drifting 🌊'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
