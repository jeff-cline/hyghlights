import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { getLatestReview, getHistory, overallScore, type Scores } from '@/lib/thrive'
import { getPlates } from '@/lib/plates'
import { PILLARS } from '@/lib/pillars'
import { getLatestWeekly, getWeeklyHistory, weeklyOverall, recommendations, WEEKLY_CATEGORIES, type WScores } from '@/lib/weekly'
import { getMyAssessments } from '@/lib/assessments'
import PillarReviewForm from '@/components/PillarReviewForm'
import WeeklyReviewForm from '@/components/WeeklyReviewForm'
import PlatesBoard from '@/components/PlatesBoard'
import AssessmentsHub from '@/components/AssessmentsHub'

const TABS = [
  { key: 'pillars', label: 'Whole-Person' },
  { key: 'weekly', label: 'Weekly Review' },
  { key: 'plates', label: 'Spinning Plates' },
  { key: 'assess', label: 'Assessments' },
]

const VALID = ['pillars', 'weekly', 'plates', 'assess']

export default async function ThrivePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser()
  if (!user) redirect('/login')
  const sp = await searchParams
  const tab = VALID.includes(sp.tab ?? '') ? (sp.tab as string) : 'pillars'

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="inline-flex items-center gap-2 bg-[#34c5c5]/15 text-[#0D9488] rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
        iThrive · whole-person dashboard
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-6">Thrive 🚀</h1>

      <div className="flex gap-2 mb-8">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/thrive?tab=${t.key}`}
            className={`text-sm font-bold rounded-full px-4 py-1.5 border transition-colors ${
              tab === t.key ? 'bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white border-transparent' : 'bg-white border-gray-100 text-gray-500 hover:border-[#34c5c5]/40'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === 'pillars' ? <Pillars userId={user.userId} />
        : tab === 'weekly' ? <Weekly userId={user.userId} />
        : tab === 'assess' ? <Assess userId={user.userId} />
        : <Plates userId={user.userId} />}
    </main>
  )
}

async function Assess({ userId }: { userId: string }) {
  const done = await getMyAssessments(userId)
  return <AssessmentsHub done={done} />
}

async function Weekly({ userId }: { userId: string }) {
  const [latest, history] = await Promise.all([getLatestWeekly(userId), getWeeklyHistory(userId)])
  const scores = (latest?.scores as WScores) ?? {}
  const recs = latest ? recommendations(scores) : []

  return (
    <div className="space-y-8">
      {latest && (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-800">Last week</h2>
            <span className="text-2xl font-black text-[#e07800]">{weeklyOverall(scores)}<span className="text-sm text-gray-400">/10</span></span>
          </div>
          <div className="space-y-2 mb-6">
            {WEEKLY_CATEGORIES.map((c) => {
              const v = Number(scores[c.key] ?? 0)
              return (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 text-sm font-bold text-gray-600">{c.emoji} {c.label}</span>
                  <div className="flex-1 bg-[#F4F1EC] rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full bg-[#e07800]" style={{ width: `${v * 10}%` }} />
                  </div>
                  <span className="text-sm font-black text-gray-700 w-6 text-right">{v}</span>
                </div>
              )
            })}
          </div>
          <div className="bg-[#34c5c5]/10 rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0D9488] mb-2">This week, focus on</p>
            <ul className="space-y-1.5">
              {recs.map((r, i) => (
                <li key={i} className="text-gray-700 text-sm flex gap-2"><span className="text-[#e07800]">→</span>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <WeeklyReviewForm initial={scores} />

      {history.length > 1 && (
        <section>
          <h3 className="text-gray-800 font-black mb-3">Weekly history</h3>
          <div className="space-y-2">
            {history.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-3">
                <span className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                <span className="font-black text-[#0D9488]">{weeklyOverall(r.scores as WScores)}/10</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

async function Pillars({ userId }: { userId: string }) {
  const [latest, history] = await Promise.all([getLatestReview(userId), getHistory(userId)])
  const latestScores = (latest?.scores as Scores) ?? {}

  return (
    <div className="space-y-8">
      {latest && (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-800">Your latest balance</h2>
            <span className="text-2xl font-black text-[#e07800]">{overallScore(latestScores)}<span className="text-sm text-gray-400">/10</span></span>
          </div>
          <div className="space-y-2">
            {PILLARS.map((p) => {
              const v = Number(latestScores[p.key] ?? 0)
              return (
                <div key={p.key} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm font-bold text-gray-600">{p.emoji} {p.label}</span>
                  <div className="flex-1 bg-[#F4F1EC] rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${v * 10}%`, background: p.color }} />
                  </div>
                  <span className="text-sm font-black text-gray-700 w-6 text-right">{v}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <PillarReviewForm initial={latestScores} />

      {history.length > 1 && (
        <section>
          <h3 className="text-gray-800 font-black mb-3">Check-in history</h3>
          <div className="space-y-2">
            {history.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-3">
                <span className="text-sm text-gray-600 capitalize">{r.period} · {new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                <span className="font-black text-[#0D9488]">{overallScore(r.scores as Scores)}/10</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

async function Plates({ userId }: { userId: string }) {
  const { active, done } = await getPlates(userId)
  const ser = (p: (typeof active)[number]) => ({
    id: p.id,
    title: p.title,
    dueDate: p.dueDate ? p.dueDate.toISOString() : null,
    completedAt: p.completedAt ? p.completedAt.toISOString() : null,
    notes: p.notes,
  })
  return <PlatesBoard active={active.map(ser)} done={done.map(ser)} />
}
