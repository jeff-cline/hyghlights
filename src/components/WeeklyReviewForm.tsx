'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WEEKLY_CATEGORIES } from '@/lib/weekly-constants'

export default function WeeklyReviewForm({ initial }: { initial: Record<string, number> }) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {}
    for (const c of WEEKLY_CATEGORIES) s[c.key] = initial[c.key] ?? 5
    return s
  })
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    const res = await fetch('/api/thrive/weekly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores, note: note || null }),
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
      <h2 className="text-xl font-black text-gray-800 mb-1">This week&apos;s review</h2>
      <p className="text-gray-500 text-sm mb-6">Rate how you executed 0–10. Your recommendations update from the lowest scores.</p>

      <div className="space-y-4">
        {WEEKLY_CATEGORIES.map((c) => (
          <div key={c.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-gray-700">{c.emoji} {c.label}</span>
              <span className="text-sm font-black text-[#e07800]">{scores[c.key]}</span>
            </div>
            <input
              type="range" min={0} max={10} value={scores[c.key]}
              onChange={(e) => setScores((s) => ({ ...s, [c.key]: Number(e.target.value) }))}
              className="w-full accent-[#e07800]"
            />
          </div>
        ))}
      </div>

      <textarea
        value={note} onChange={(e) => setNote(e.target.value)} rows={2}
        placeholder="Notes on the week (optional)…"
        className="w-full mt-5 rounded-2xl bg-[#F6F8FA] border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#34c5c5] focus:border-transparent resize-none"
      />

      <div className="flex items-center gap-4 mt-4">
        <button onClick={save} disabled={saving} className="bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-7 py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50">
          {saving ? 'Saving…' : 'Save weekly review ✨'}
        </button>
        {saved && <span className="text-[#0D9488] font-bold text-sm">Saved ✓</span>}
      </div>
    </div>
  )
}
