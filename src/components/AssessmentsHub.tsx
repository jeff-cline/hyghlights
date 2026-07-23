'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUIZZES, QUIZ_BY_KEY, type Quiz } from '@/lib/quizzes'

type Done = Record<string, { resultKey: string; resultLabel: string }>

function Runner({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState(-1) // -1 intro, 0..n-1 questions, n result
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<{ key: string; label: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function choose(optIndex: number) {
    const next = [...answers, optIndex]
    setAnswers(next)
    if (next.length < quiz.questions.length) {
      setStep(next.length)
    } else {
      setSaving(true)
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizKey: quiz.key, answers: next }),
      })
      const b = await res.json().catch(() => ({}))
      setSaving(false)
      if (res.ok) { setResult({ key: b.resultKey, label: b.resultLabel }); setStep(quiz.questions.length) }
    }
  }

  const resultDef = result ? quiz.results[result.key] : null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
        {step === -1 && (
          <div className="text-center">
            <div className="text-4xl mb-3">{quiz.emoji}</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">{quiz.title}</h2>
            <p className="text-gray-500 mb-6">{quiz.intro}</p>
            <button onClick={() => setStep(0)} className="bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-8 py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform">
              Start ({quiz.questions.length} questions)
            </button>
          </div>
        )}

        {step >= 0 && step < quiz.questions.length && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#0D9488] mb-3">Question {step + 1} of {quiz.questions.length}</p>
            <h3 className="text-xl font-black text-gray-800 mb-5">{quiz.questions[step].q}</h3>
            <div className="space-y-2">
              {quiz.questions[step].options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={saving}
                  className="w-full text-left bg-[#F6F8FA] hover:bg-[#34c5c5]/10 border border-gray-100 hover:border-[#34c5c5]/40 rounded-2xl px-5 py-3 font-bold text-gray-700 transition-colors disabled:opacity-50"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === quiz.questions.length && resultDef && (
          <div className="text-center">
            <div className="text-5xl mb-3">{resultDef.emoji}</div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#0D9488] mb-1">You are</p>
            <h2 className="text-2xl font-black text-gray-800 mb-3">{resultDef.label}</h2>
            <p className="text-gray-600 mb-6">{resultDef.blurb}</p>
            <button onClick={() => { onClose(); router.refresh() }} className="bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-8 py-3 rounded-full shadow-lg hover:scale-[1.02] transition-transform">
              Done ✨
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AssessmentsHub({ done }: { done: Done }) {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div>
      <p className="text-gray-500 mb-6">Know yourself to grow yourself. Take each — your results shape your dashboard.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {QUIZZES.map((quiz) => {
          const d = done[quiz.key]
          const rd = d ? quiz.results[d.resultKey] : null
          return (
            <button
              key={quiz.key}
              onClick={() => setActive(quiz.key)}
              className="text-left bg-white border border-gray-100 rounded-3xl shadow-sm p-6 hover:border-[#34c5c5]/40 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-2">{quiz.emoji}</div>
              <h3 className="font-black text-gray-800">{quiz.title}</h3>
              {d ? (
                <p className="text-sm mt-1"><span className="text-[#0D9488] font-bold">{rd?.emoji} {d.resultLabel}</span> <span className="text-gray-400">· retake</span></p>
              ) : (
                <p className="text-sm text-[#e07800] font-bold mt-1">Take it →</p>
              )}
            </button>
          )
        })}
      </div>

      {active && <Runner quiz={QUIZ_BY_KEY[active]} onClose={() => setActive(null)} />}
    </div>
  )
}
