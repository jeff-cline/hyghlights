'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PILLARS } from '@/lib/pillars'

export default function PillarReviewForm({ initial }: { initial: Record<string, number> }) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {}
    for (const p of PILLARS) s[p.key] = initial[p.key] ?? 5
    return s
  })
  const [period, setPeriod] = useState('weekly')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    const res = await fetch('/api/thrive/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, scores, note: note || null }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setNote('')
      setTimeout(() => { setSaved(false); router.refresh() }, 1600)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-black text-gray-800">Whole-person check-in</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#34c5c5]"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
          <option value="adhoc">Ad-hoc</option>
        </select>
      </div>
      <p className="text-gray-500 text-sm mb-6">Score yourself 0–10 in each pillar. Honest beats perfect.</p>

      <div className="space-y-4">
        {PILLARS.map((p) => (
          <div key={p.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-gray-700">{p.emoji} {p.label}</span>
              <span className="text-sm font-black" style={{ color: p.color }}>{scores[p.key]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={scores[p.key]}
              onChange={(e) => setScores((s) => ({ ...s, [p.key]: Number(e.target.value) }))}
              className="w-full accent-[#e07800]"
            />
          </div>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Reflection (optional) — what moved, what needs attention…"
        className="w-full mt-5 rounded-2xl bg-[#F6F8FA] border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent resize-none"
      />

      <div className="flex items-center gap-4 mt-4">
        <button onClick={save} disabled={saving} className="bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-7 py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50">
          {saving ? 'Saving…' : 'Save check-in ✨'}
        </button>
        {saved && <span className="text-[#0D9488] font-bold text-sm">Saved ✓</span>}
      </div>
    </div>
  )
}
