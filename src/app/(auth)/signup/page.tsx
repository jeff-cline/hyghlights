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
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent'

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight">
            <span className="text-gray-800">HYgh</span><span className="text-[#e07800]">Lights</span>
          </Link>
          <p className="mt-2 text-gray-500">Start capturing your wins.</p>
        </div>
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
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account? <Link href="/login" className="text-[#0D9488] font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
