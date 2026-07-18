import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getHomeData } from '@/lib/highlights'
import { CATEGORY_BY_KEY, categoryLabel } from '@/lib/categories'
import HighlightComposer from '@/components/HighlightComposer'

function fmtTime(d: Date) {
  return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function HomePage() {
  const user = await requireUser()
  if (!user) redirect('/login')

  const { profile, todays, recent, total, categoryCounts, loggedToday } = await getHomeData(
    user.userId,
    user.email,
  )

  const name = profile.displayName || user.email.split('@')[0]

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Streak header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Welcome back</p>
          <h1 className="text-2xl md:text-3xl font-black text-white">{name}</h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-[#C9A24B]">🔥 {profile.currentStreak}</div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-wide">day streak</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Stat label="Highlights" value={total} />
        <Stat label="Best streak" value={profile.longestStreak} />
        <Stat label="Today" value={todays.length} />
      </div>

      {/* Composer */}
      <HighlightComposer loggedToday={loggedToday} celebrationSong={profile.celebrationSong} />

      {/* Today */}
      {todays.length > 0 && (
        <section className="mt-10">
          <h3 className="text-white font-black mb-3">Today&apos;s highlights</h3>
          <div className="space-y-3">
            {todays.map((h) => (
              <HighlightCard key={h.id} category={h.category} text={h.text} when={h.createdAt} />
            ))}
          </div>
        </section>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryCounts).length > 0 && (
        <section className="mt-10">
          <h3 className="text-white font-black mb-3">By life category</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => (
                <span key={key} className="text-sm font-bold rounded-full px-3 py-1.5 bg-black/40 border border-white/10 text-white/70">
                  {CATEGORY_BY_KEY[key]?.emoji} {categoryLabel(key)} <span className="text-[#C9A24B]">{count}</span>
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Recent feed */}
      {recent.length > 0 && (
        <section className="mt-10">
          <h3 className="text-white font-black mb-3">Recent wins</h3>
          <div className="space-y-3">
            {recent.map((h) => (
              <HighlightCard key={h.id} category={h.category} text={h.text} when={h.createdAt} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#15151a] border border-white/10 rounded-2xl px-4 py-3 text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      <p className="text-white/40 text-[11px] font-bold uppercase tracking-wide">{label}</p>
    </div>
  )
}

function HighlightCard({ category, text, when }: { category: string; text: string; when: Date }) {
  const c = CATEGORY_BY_KEY[category]
  return (
    <div className="bg-[#15151a] border border-white/10 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm font-bold" style={{ color: c?.color ?? '#C9A24B' }}>
          {c?.emoji} {categoryLabel(category)}
        </span>
        <span className="text-white/30 text-xs">· {fmtTime(when)}</span>
      </div>
      <p className="text-white/90 whitespace-pre-wrap">{text}</p>
    </div>
  )
}
