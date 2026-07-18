'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    })
    if (!res.ok) {
      const b = await res.json().catch(() => ({}))
      setError(b.error ?? 'Could not create your account.')
      setSubmitting(false)
      return
    }
    const result = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/home' })
    setSubmitting(false)
    window.location.assign(result?.url ?? '/home')
  }

  const field =
    'w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#C9A24B] focus:border-transparent'

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#15151a] via-[#0b0b0d] to-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight">
            <span className="text-[#ededed]">HYgh</span><span className="text-[#C9A24B]">Lights</span>
          </Link>
          <p className="mt-2 text-white/50">Start capturing your wins.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#15151a] rounded-3xl border border-white/10 p-8 space-y-5 shadow-2xl">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold px-4 py-3">{error}</div>
          )}
          <input className={field} type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={field} type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={field} type="password" required placeholder="Password (min 8)" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#C9A24B] to-[#b8860b] text-black font-black px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-60">
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account? <Link href="/login" className="text-[#34c5c5] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
