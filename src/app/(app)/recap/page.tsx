import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { getRecap, type Period } from '@/lib/recap'
import { CATEGORY_BY_KEY, categoryLabel } from '@/lib/categories'

const TABS: Array<{ key: Period; label: string }> = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
]

export default async function RecapPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const user = await requireUser()
  if (!user) redirect('/login')
  const sp = await searchParams
  const period = (['week', 'month', 'quarter', 'year'].includes(sp.p ?? '') ? sp.p : 'month') as Period

  const recap = await getRecap(user.userId, period)
  const max = Math.max(1, ...Object.values(recap.byCategory))
  const topCat = recap.topCategory ? CATEGORY_BY_KEY[recap.topCategory] : null

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">Recap</h1>
      <p className="text-gray-500 mb-6">Look back and honor how far you&apos;ve come.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => {
          const on = t.key === period
          return (
            <Link
              key={t.key}
              href={`/recap?p=${t.key}`}
              className={`text-sm font-bold rounded-full px-4 py-1.5 border transition-colors ${
                on ? 'bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white border-transparent' : 'bg-white border-gray-100 text-gray-500 hover:border-[#34c5c5]/40'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      {/* Recap card */}
      <div className="bg-gradient-to-br from-[#34c5c5]/10 via-white to-[#E8A849]/10 border border-gray-100 rounded-3xl shadow-sm p-8 mb-8">
        <div className="inline-flex items-center gap-2 bg-[#34c5c5]/15 text-[#0D9488] rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
          {recap.label}
        </div>
        {recap.total === 0 ? (
          <p className="text-gray-500">No HYghLights in this period yet — go make some magic.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Big value={recap.total} label="HYghLights" />
              <Big value={recap.activeDays} label="Active days" />
              <Big value={Object.keys(recap.byCategory).length} label="Categories" />
            </div>
            {topCat && (
              <p className="text-gray-700">
                Your brightest area was{' '}
                <span className="font-black" style={{ color: topCat.color }}>{topCat.emoji} {topCat.label}</span>.
              </p>
            )}
          </>
        )}
      </div>

      {/* Category bars */}
      {Object.keys(recap.byCategory).length > 0 && (
        <section className="mb-8">
          <h3 className="text-gray-800 font-black mb-3">By life category</h3>
          <div className="space-y-2">
            {Object.entries(recap.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => {
                const c = CATEGORY_BY_KEY[key]
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 text-sm font-bold text-gray-600">{c?.emoji} {categoryLabel(key)}</span>
                    <div className="flex-1 bg-[#F4F1EC] rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, background: c?.color ?? '#e07800' }} />
                    </div>
                    <span className="text-sm font-black text-gray-700 w-6 text-right">{count}</span>
                  </div>
                )
              })}
          </div>
        </section>
      )}

      {/* Jarred keepsakes */}
      {recap.jarred.length > 0 && (
        <section>
          <h3 className="text-gray-800 font-black mb-3">In the jar 🫙</h3>
          <div className="space-y-3">
            {recap.jarred.map((h) => {
              const c = CATEGORY_BY_KEY[h.category]
              return (
                <div key={h.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
                  <span className="text-sm font-bold" style={{ color: c?.color ?? '#e07800' }}>{c?.emoji} {categoryLabel(h.category)}</span>
                  <p className="text-gray-700 mt-1">{h.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

function Big({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black text-gray-800">{value}</div>
      <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wide">{label}</p>
    </div>
  )
}
