import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getHomeData } from '@/lib/highlights'
import { CATEGORY_BY_KEY, categoryLabel } from '@/lib/categories'
import { computeBadges, earnedCount } from '@/lib/badges'
import HighlightComposer from '@/components/HighlightComposer'
import HighlightMedia from '@/components/HighlightMedia'

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

  // First-timers do the peace-place ritual before anything else. 🧘‍♀️
  if (!profile.onboardedAt) redirect('/onboarding')

  const name = profile.displayName || user.email.split('@')[0]
  const badges = computeBadges({
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    total,
    distinctCategories: Object.keys(categoryCounts).length,
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* Streak header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#34c5c5]/15 text-[#0D9488] rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            Welcome back
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">{name}</h1>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-[#e07800]">🔥 {profile.currentStreak}</div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">day streak</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Stat label="HYghLights" value={total} />
        <Stat label="Best streak" value={profile.longestStreak} />
        <Stat label="Today" value={todays.length} />
      </div>

      {/* Badges */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-800 font-black">Badges</h3>
          <span className="text-xs font-bold text-[#0D9488]">{earnedCount(badges)}/{badges.length} earned</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.key}
              title={b.hint}
              className={`text-sm font-bold rounded-full px-3 py-1.5 border ${
                b.earned
                  ? 'bg-gradient-to-r from-[#E8A849]/15 to-[#e07800]/10 border-[#E8A849]/40 text-gray-800'
                  : 'bg-white border-gray-100 text-gray-300'
              }`}
            >
              <span className={b.earned ? '' : 'grayscale opacity-50'}>{b.emoji}</span> {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* Composer */}
      <HighlightComposer loggedToday={loggedToday} celebrationSong={profile.celebrationSong} />

      {/* Today */}
      {todays.length > 0 && (
        <section className="mt-10">
          <h3 className="text-gray-800 font-black mb-3">Today&apos;s HYghLights</h3>
          <div className="space-y-3">
            {todays.map((h) => (
              <HighlightCard key={h.id} category={h.category} text={h.text} when={h.createdAt} photoUrl={h.photoUrl} videoUrl={h.videoUrl} />
            ))}
          </div>
        </section>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryCounts).length > 0 && (
        <section className="mt-10">
          <h3 className="text-gray-800 font-black mb-3">By life category</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => (
                <span key={key} className="text-sm font-bold rounded-full px-3 py-1.5 bg-white border border-gray-100 shadow-sm text-gray-600">
                  {CATEGORY_BY_KEY[key]?.emoji} {categoryLabel(key)} <span className="text-[#e07800]">{count}</span>
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Recent feed */}
      {recent.length > 0 && (
        <section className="mt-10">
          <h3 className="text-gray-800 font-black mb-3">Recent wins</h3>
          <div className="space-y-3">
            {recent.map((h) => (
              <HighlightCard key={h.id} category={h.category} text={h.text} when={h.createdAt} photoUrl={h.photoUrl} videoUrl={h.videoUrl} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-center shadow-sm">
      <div className="text-2xl font-black text-gray-800">{value}</div>
      <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wide">{label}</p>
    </div>
  )
}

function HighlightCard({
  category,
  text,
  when,
  photoUrl,
  videoUrl,
}: {
  category: string
  text: string
  when: Date
  photoUrl?: string | null
  videoUrl?: string | null
}) {
  const c = CATEGORY_BY_KEY[category]
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm font-bold" style={{ color: c?.color ?? '#e07800' }}>
          {c?.emoji} {categoryLabel(category)}
        </span>
        <span className="text-gray-400 text-xs">· {fmtTime(when)}</span>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{text}</p>
      <HighlightMedia photoUrl={photoUrl} videoUrl={videoUrl} />
    </div>
  )
}
