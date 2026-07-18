'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/home'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await signIn('credentials', { email, password, redirect: false, callbackUrl })
    setSubmitting(false)
    if (!result || result.error) {
      setError('Invalid email or password.')
      return
    }
    window.location.assign(result.url ?? callbackUrl)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black tracking-tight">
          <span className="text-gray-800">HYgh</span><span className="text-[#e07800]">Lights</span>
        </Link>
        <p className="mt-2 text-gray-500">Welcome back. Time to celebrate your wins.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-8 space-y-5 shadow-sm">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
          <input
            id="email" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
          <input
            id="password" type="password" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent"
          />
        </div>
        <button
          type="submit" disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-gray-400">
          Your Beyond Limits login works here too.
        </p>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        New here? <Link href="/signup" className="text-[#0D9488] font-bold hover:underline">Create your account</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white flex items-center justify-center px-4 py-16">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
