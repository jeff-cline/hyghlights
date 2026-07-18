'use client'

import { useState } from 'react'
import { CATEGORY_BY_KEY } from '@/lib/categories'

type Card = { id: string; category: string; text: string; inJar: boolean }

export default function JarBoard({ monthLabel, initial }: { monthLabel: string; initial: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initial)
  const [over, setOver] = useState(false)
  const [pop, setPop] = useState(false)

  const loose = cards.filter((c) => !c.inJar)
  const jarred = cards.filter((c) => c.inJar)

  async function move(id: string, inJar: boolean) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, inJar } : c)))
    if (inJar) {
      setPop(true)
      setTimeout(() => setPop(false), 500)
    }
    try {
      await fetch('/api/jar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlightId: id, inJar }),
      })
    } catch {
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, inJar: !inJar } : c)))
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Loose cards */}
      <div>
        <h3 className="font-black text-gray-800 mb-3">Drag {monthLabel} into the jar</h3>
        {loose.length === 0 ? (
          <p className="text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl p-5 text-center">
            All tucked in 🫙 — every HYghLight is in the jar.
          </p>
        ) : (
          <div className="space-y-2">
            {loose.map((c) => {
              const cat = CATEGORY_BY_KEY[c.category]
              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
                  className="cursor-grab active:cursor-grabbing bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 hover:border-[#E8A849]/50"
                >
                  <span className="text-sm font-bold" style={{ color: cat?.color ?? '#e07800' }}>{cat?.emoji}</span>{' '}
                  <span className="text-gray-700 text-sm">{c.text}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Jar drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const id = e.dataTransfer.getData('text/plain')
          if (id) move(id, true)
        }}
        className={`rounded-3xl border-2 border-dashed p-6 text-center transition-colors ${
          over ? 'border-[#e07800] bg-[#E8A849]/10' : 'border-gray-200 bg-white'
        }`}
      >
        <div className={`text-7xl transition-transform ${pop ? 'scale-125' : ''}`}>🫙</div>
        <div className="font-black text-gray-800 mt-2">{jarred.length} inside</div>
        <p className="text-gray-400 text-xs mb-4">Drop a HYghLight here to keep it forever.</p>
        {jarred.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {jarred.map((c) => {
              const cat = CATEGORY_BY_KEY[c.category]
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => move(c.id, false)}
                  title={`${c.text} — click to take out`}
                  className="text-xl bg-[#F4F1EC] rounded-full w-9 h-9 flex items-center justify-center hover:bg-[#34c5c5]/15"
                >
                  {cat?.emoji ?? '⭐'}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
