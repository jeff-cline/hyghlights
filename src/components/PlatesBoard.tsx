'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Plate = {
  id: string
  title: string
  dueDate: string | null
  completedAt: string | null
  notes: string | null
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : null
}

export default function PlatesBoard({ active, done }: { active: Plate[]; done: Plate[] }) {
  const router = useRouter()
  const [list, setList] = useState<Plate[]>(active)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [notes, setNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    await fetch('/api/plates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), dueDate: due || null, notes: notes || null }),
    })
    setTitle(''); setDue(''); setNotes(''); setAdding(false)
    router.refresh()
  }

  async function complete(id: string) {
    setList((l) => l.filter((p) => p.id !== id))
    await fetch('/api/plates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'done' }),
    })
    router.refresh()
  }

  async function remove(id: string) {
    setList((l) => l.filter((p) => p.id !== id))
    await fetch('/api/plates', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    router.refresh()
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return
    const from = list.findIndex((p) => p.id === dragId)
    const to = list.findIndex((p) => p.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...list]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setList(next)
    setDragId(null)
    fetch('/api/plates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: next.map((p) => p.id) }),
    })
  }

  const field =
    'rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent'

  return (
    <div className="space-y-8">
      {/* Add */}
      <form onSubmit={add} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-3">
        <h2 className="font-black text-gray-800">Add a plate 🍽️</h2>
        <input className={`${field} w-full`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project, follow-up, or thing you’re spinning…" />
        <div className="flex flex-wrap gap-3">
          <input className={field} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <input className={`${field} flex-1 min-w-[200px]`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" />
        </div>
        <button type="submit" disabled={adding} className="bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-6 py-2.5 rounded-full shadow hover:scale-[1.02] transition-transform disabled:opacity-50">
          {adding ? 'Adding…' : 'Add plate'}
        </button>
      </form>

      {/* Active plates */}
      <section>
        <h3 className="text-gray-800 font-black mb-3">Spinning now ({list.length}) — drag to prioritize</h3>
        {list.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-center text-gray-500">Nothing spinning — add your first plate.</div>
        ) : (
          <div className="space-y-2">
            {list.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={() => setDragId(p.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(p.id)}
                className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 cursor-grab active:cursor-grabbing"
              >
                <button type="button" onClick={() => complete(p.id)} title="Mark complete" className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#0D9488] hover:bg-[#34c5c5]/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800">{p.title}</div>
                  {(p.dueDate || p.notes) && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {p.dueDate && <span className="text-[#e07800] font-bold">due {fmt(p.dueDate)}</span>}
                      {p.dueDate && p.notes && ' · '}
                      {p.notes}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => remove(p.id)} className="text-gray-300 hover:text-red-500 text-lg leading-none shrink-0">×</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Master accomplishments */}
      {done.length > 0 && (
        <section>
          <h3 className="text-gray-800 font-black mb-3">Master Accomplishments 🏆 ({done.length})</h3>
          <div className="space-y-2">
            {done.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-gradient-to-r from-[#E8A849]/10 to-white border border-[#E8A849]/30 rounded-2xl px-4 py-3">
                <span className="text-[#e07800]">✓</span>
                <span className="font-bold text-gray-700 flex-1">{p.title}</span>
                {p.completedAt && <span className="text-xs text-gray-400">{fmt(p.completedAt)}</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
