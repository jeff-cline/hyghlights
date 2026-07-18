'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GroupsManager() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    const b = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(b.error ?? 'Could not create.')
    router.push(`/groups/${b.group.id}`)
  }

  async function join(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    setError(null)
    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })
    const b = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(b.error ?? 'Could not join.')
    router.push(`/groups/${b.group.id}`)
  }

  const field =
    'w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent'
  const btn =
    'bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-6 py-3 rounded-full hover:scale-[1.02] transition-transform disabled:opacity-50'

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {error && (
        <div className="sm:col-span-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3">{error}</div>
      )}
      <form onSubmit={create} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-3">Start a circle</h3>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Crew, Family, Accountability" />
        <button type="submit" disabled={busy} className={`mt-4 ${btn}`}>Create</button>
      </form>
      <form onSubmit={join} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
        <h3 className="font-black text-gray-800 mb-3">Join with a code</h3>
        <input className={`${field} uppercase tracking-widest`} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="INVITE CODE" />
        <button type="submit" disabled={busy} className={`mt-4 ${btn}`}>Join</button>
      </form>
    </div>
  )
}
