'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { BOOTCAMP_OFFER, SHARED_PASSWORD_NOTICE } from '@/lib/bootcamp-offer'

/** What the server said when the address already had an account. */
type SsoNotice = { title: string; body: string }

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sso, setSso] = useState<SsoNotice | null>(null)
  const [offer, setOffer] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSso(null)
    setSubmitting(true)
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })
    const b = await res.json().catch(() => ({}))

    if (!res.ok) {
      // A Beyond Limits member, not a mistake. Their password already works
      // here, so this is a welcome rather than an error.
      if (b.sso && b.title) setSso({ title: b.title, body: b.body })
      else setError(b.error ?? 'Could not create your account.')
      setSubmitting(false)
      return
    }

    // Sign them in first, so the offer is something they read on the way in
    // rather than a gate in front of the product they just joined.
    await signIn('credentials', { email, password, redirect: false, callbackUrl: '/home' })
    setSubmitting(false)
    setOffer(true)
  }

  const field =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent'

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight">
            <span className="text-gray-800">HYgh</span><span className="text-[#e07800]">Lights</span>
          </Link>
          <p className="mt-2 text-gray-500">
            {offer ? "You're in. One more thing." : 'Start capturing your wins.'}
          </p>
        </div>

        {/* ── already a Beyond Limits member ─────────────────────────── */}
        {sso ? (
          <div className="rounded-3xl border border-[#0D9488]/20 bg-white p-8 shadow-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0D9488]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#0D9488]">
              Single sign-on
            </span>
            <h1 className="mt-4 text-2xl font-black leading-tight text-gray-800">{sso.title}</h1>
            <p className="mt-3 text-gray-600">{sso.body}</p>
            <Link
              href={`/login?email=${encodeURIComponent(email)}`}
              className="mt-6 block w-full rounded-full bg-[#0D9488] px-8 py-3.5 text-center font-black text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              Sign in with that account
            </Link>
            <button
              type="button"
              onClick={() => { setSso(null); setEmail('') }}
              className="mt-3 w-full text-sm font-bold text-gray-500 hover:text-gray-800"
            >
              Use a different email
            </button>
          </div>
        ) : offer ? (
          /* ── new to both products: the Beyond Limits offer ─────────── */
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="rounded-2xl bg-gradient-to-br from-[#0B1D2A] via-[#123243] to-[#0B1D2A] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#9FE8E8]">
                {BOOTCAMP_OFFER.sub}
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight">
                {BOOTCAMP_OFFER.headline}
              </h2>
              <p className="mt-3 text-white/70">
                Live classes, the full Vault, and the 34-Minute Method. Your HYghLights
                login already works there — it is the same account.
              </p>
              <p className="mt-4 inline-block rounded-full bg-[#E8A849] px-4 py-1.5 text-sm font-black text-[#0B1D2A]">
                {BOOTCAMP_OFFER.discount} with code {BOOTCAMP_OFFER.code}
              </p>
            </div>
            <a
              href={BOOTCAMP_OFFER.href}
              className="mt-5 block w-full rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3.5 text-center font-black text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              Claim {BOOTCAMP_OFFER.discount}
            </a>
            <Link
              href="/home"
              className="mt-3 block w-full text-center text-sm font-bold text-gray-500 hover:text-gray-800"
            >
              Not now — take me to HYghLights
            </Link>
          </div>
        ) : (
          /* ── the form ───────────────────────────────────────────────── */
          <>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-8 space-y-5 shadow-sm">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3">{error}</div>
              )}
              <input className={field} type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={field} type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={field} type="password" required placeholder="Password (min 8)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-60">
                {submitting ? 'Creating…' : 'Create account'}
              </button>
              {/* Said before they choose a password, not after they have one. */}
              <p className="text-center text-xs text-gray-500">{SHARED_PASSWORD_NOTICE}</p>
            </form>
            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account? <Link href="/login" className="text-[#0D9488] font-bold hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
