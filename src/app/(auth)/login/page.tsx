'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Wordmark from '@/components/Wordmark'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/home'

  // Carried from signup and from the SSO welcome, so nobody retypes an
  // address they just entered on the previous screen.
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  // No browser can be asked whether it is in a library. The person who knows is
  // the one signing in, so they are the one asked.
  const [publicComputer, setPublicComputer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await signIn('credentials', {
      email, password, publicComputer: String(publicComputer), redirect: false, callbackUrl,
    })
    setSubmitting(false)
    if (!result || result.error) {
      setError(
        'That email and password did not match. If your browser filled it in, ' +
        'the saved one may be out of date — try typing it, or reset it below.',
      )
      return
    }
    window.location.assign(result.url ?? callbackUrl)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-black tracking-tight">
          <Wordmark />
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
          <div className="flex items-baseline justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
            <Link href="/forgot" className="text-xs font-bold text-[#0D9488] hover:underline">
              Forgot it?
            </Link>
          </div>
          <input
            id="password" type="password" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#F6F8FA] p-4">
          <input type="checkbox" checked={publicComputer}
                 onChange={(e) => setPublicComputer(e.target.checked)}
                 className="mt-0.5 h-4 w-4 accent-[#0D9488]" />
          <span className="text-xs leading-relaxed text-gray-600">
            <span className="font-bold text-gray-800">
              This is a shared or public computer
            </span>
            <span className="mt-0.5 block">
              {publicComputer
                ? 'You will be signed out after 8 hours.'
                : 'Leave this unticked and you will stay signed in on this browser for 90 days.'}
            </span>
          </span>
        </label>

        <button
          type="submit" disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-8 py-3.5 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-gray-400">
          One account for hYghlights and Beyond Limits Bootcamp —{' '}
          <Link href="/forgot" className="font-bold text-[#0D9488] hover:underline">
            reset it
          </Link>{' '}
          and the new password works on both.
        </p>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        New here?{' '}
        <Link
          href={email ? `/signup?email=${encodeURIComponent(email)}` : '/signup'}
          className="text-[#0D9488] font-bold hover:underline"
        >
          Create your account
        </Link>
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
