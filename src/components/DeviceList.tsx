'use client'

import { useState } from 'react'

export type DeviceRow = {
  id: string
  label: string
  lastIp: string | null
  createdAt: string
  lastSeenAt: string
  isCurrent: boolean
}

const WHEN = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Where you are signed in, and how to stop being.
 *
 * The counterweight to a ninety-day session. A long session is only a good
 * offer if ending one is easy, and ending one has to be possible from a browser
 * that is not the one you want gone — a stolen laptop cannot be asked to sign
 * itself out.
 */
export default function DeviceList({ initial }: { initial: DeviceRow[] }) {
  const [devices, setDevices] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function post(body: Record<string, unknown>, key: string) {
    setBusy(key); setError(null)
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { setError('That did not work. Try again.'); return false }
      return true
    } catch {
      setError('That did not work. Try again.'); return false
    } finally {
      setBusy(null)
    }
  }

  async function revoke(id: string) {
    if (await post({ action: 'revoke', deviceId: id }, id)) {
      setDevices((d) => d.filter((x) => x.id !== id))
    }
  }

  async function revokeOthers() {
    if (await post({ action: 'revokeOthers' }, 'others')) {
      setDevices((d) => d.filter((x) => x.isCurrent))
    }
  }

  const others = devices.filter((d) => !d.isCurrent).length

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-lg font-black text-gray-800">Where you are signed in</h2>
      <p className="mt-1 text-xs text-gray-500">
        You stay signed in for 90 days on a browser you have used before. A new
        computer, a different browser or a private window always asks for your
        email and password.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {devices.map((d) => (
          <li key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F6F8FA] px-5 py-4">
            <div className="min-w-0">
              <p className="font-bold text-gray-800">
                {d.label}
                {d.isCurrent && (
                  <span className="ml-2 rounded-full bg-[#0D9488]/10 px-2 py-0.5 text-xs font-black text-[#0D9488]">
                    This browser
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Last used {WHEN.format(new Date(d.lastSeenAt))}
                {d.lastIp ? ` · ${d.lastIp}` : ''}
              </p>
            </div>
            {!d.isCurrent && (
              <button type="button" onClick={() => revoke(d.id)} disabled={busy === d.id}
                      className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-red-600 ring-1 ring-gray-200 hover:bg-red-50 disabled:opacity-60">
                {busy === d.id ? 'Signing out…' : 'Sign out'}
              </button>
            )}
          </li>
        ))}
      </ul>

      {others > 0 && (
        <button type="button" onClick={revokeOthers} disabled={busy === 'others'}
                className="mt-4 text-sm font-bold text-red-600 hover:underline disabled:opacity-60">
          {busy === 'others'
            ? 'Signing out…'
            : `Sign out everywhere else (${others})`}
        </button>
      )}

      <p className="mt-5 rounded-2xl bg-[#F6F8FA] p-4 text-xs leading-relaxed text-gray-500">
        Signing a device out takes effect immediately, even mid-session. If you do
        not recognise something here, sign it out and change your password — which
        also changes it on Beyond Limits Bootcamp.
      </p>
    </section>
  )
}
