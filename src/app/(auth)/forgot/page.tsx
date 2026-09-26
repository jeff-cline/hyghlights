'use client'

import { useState } from 'react'
import Link from 'next/link'
import Wordmark from '@/components/Wordmark'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await fetch('/api/forgot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Deliberately ignored. The confirmation below is the same either way —
      // a network blip must not become a hint about whether the address exists.
    }
    setSent(true)
    setBusy(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F8FA] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight">
            <Wordmark />
          </Link>
          <p className="mt-2 text-gray-500">
            {sent ? 'Check your email.' : 'We will send you a link to choose a new one.'}
          </p>
        </div>

        {sent ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#0D9488]/10">
              <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 fill-[#0D9488]">
                <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6l8 5 8-5v2.2z" />
              </svg>
            </div>
            <p className="mt-4 font-bold text-gray-900">
              If <span className="text-[#0D9488]">{email}</span> has an account, a reset
              link is on its way.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              It works for one hour. Check your spam folder if it is not there in a
              couple of minutes.
            </p>
            <p className="mt-4 rounded-xl bg-[#F6F8FA] p-3 text-xs text-gray-500">
              This is the same account you use on Beyond Limits Bootcamp, so the new
              password will work on both.
            </p>
            <Link href="/login"
                  className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3 font-black text-white shadow-lg">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit}
                className="space-y-5 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-gray-700">
                Email
              </label>
              <input id="email" type="email" required autoComplete="email" autoFocus
                     value={email} onChange={(e) => setEmail(e.target.value)}
                     className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#34c5c5]" />
              <p className="mt-2 text-xs text-gray-500">
                Use the address you sign in with on either hYghlights or Beyond Limits
                Bootcamp — they are the same account.
              </p>
            </div>
            <button type="submit" disabled={busy || !email}
                    className="w-full rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3.5 font-black text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60">
              {busy ? 'Sending…' : 'Send me a reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Remembered it? <Link href="/login" className="font-bold text-[#0D9488] hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
