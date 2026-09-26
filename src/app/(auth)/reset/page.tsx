'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Wordmark from '@/components/Wordmark'

function ResetForm() {
  const token = useSearchParams().get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // Checked here so the mismatch is caught before anything is sent, and said
  // plainly rather than as a rejected form.
  const mismatch = confirm.length > 0 && password !== confirm
  const tooShort = password.length > 0 && password.length < 8

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Those two do not match.'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/reset', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setError(j.error || 'That did not work.'); return }
      setDone(true)
    } catch {
      setError('That did not work. Try again in a moment.')
    } finally { setBusy(false) }
  }

  if (!token) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="font-bold text-gray-900">This link is incomplete.</p>
        <p className="mt-2 text-sm text-gray-600">
          Reset links expire after an hour and can only be used from the email they
          were sent in.
        </p>
        <Link href="/forgot"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3 font-black text-white shadow-lg">
          Send a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#0D9488]/10">
          <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 fill-[#0D9488]">
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
          </svg>
        </div>
        <p className="mt-4 font-bold text-gray-900">Password changed.</p>
        <p className="mt-2 text-sm text-gray-600">
          Use it here and on Beyond Limits Bootcamp — it is one account.
        </p>
        <p className="mt-3 rounded-xl bg-[#E8A849]/10 p-3 text-xs text-[#8a5a08]">
          If your browser offers to save it, say yes. An old saved password is the
          single most common reason a sign-in fails.
        </p>
        <Link href="/login"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3 font-black text-white shadow-lg">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="pw" className="mb-1.5 block text-sm font-bold text-gray-700">
          New password
        </label>
        <input id="pw" type="password" required autoComplete="new-password" autoFocus
               value={password} onChange={(e) => setPassword(e.target.value)}
               className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#34c5c5]" />
        <p className={`mt-1.5 text-xs ${tooShort ? 'text-red-600' : 'text-gray-500'}`}>
          At least 8 characters.
        </p>
      </div>
      <div>
        <label htmlFor="pw2" className="mb-1.5 block text-sm font-bold text-gray-700">
          Again, to be sure
        </label>
        <input id="pw2" type="password" required autoComplete="new-password"
               value={confirm} onChange={(e) => setConfirm(e.target.value)}
               className={`w-full rounded-xl border px-4 py-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 ${
                 mismatch ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-[#34c5c5]'}`} />
        {mismatch && <p className="mt-1.5 text-xs text-red-600">Those two do not match.</p>}
      </div>
      <button type="submit" disabled={busy || password.length < 8 || mismatch}
              className="w-full rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3.5 font-black text-white shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60">
        {busy ? 'Saving…' : 'Set my password'}
      </button>
      <p className="text-center text-xs text-gray-400">
        This changes your password on hYghlights and Beyond Limits Bootcamp together.
      </p>
    </form>
  )
}

export default function ResetPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F8FA] px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight">
            <Wordmark />
          </Link>
          <p className="mt-2 text-gray-500">Choose a new password.</p>
        </div>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  )
}
