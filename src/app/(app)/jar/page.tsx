import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import JarBoard from '@/components/JarBoard'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default async function JarPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const user = await requireUser()
  if (!user) redirect('/login')
  const sp = await searchParams

  const now = new Date()
  const year = now.getUTCFullYear()
  const selected = Math.min(11, Math.max(0, Number(sp.m ?? now.getUTCMonth())))

  const yearStart = new Date(Date.UTC(year, 0, 1))
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1))
  const rows = await prisma.highlight.findMany({
    where: { userId: user.userId, entryDate: { gte: yearStart, lt: yearEnd } },
    select: { id: true, category: true, text: true, inJar: true, entryDate: true },
    orderBy: { createdAt: 'desc' },
  })

  const perMonth = MONTHS.map(() => ({ total: 0, jarred: 0 }))
  for (const r of rows) {
    const m = new Date(r.entryDate).getUTCMonth()
    perMonth[m].total++
    if (r.inJar) perMonth[m].jarred++
  }

  const monthCards = rows
    .filter((r) => new Date(r.entryDate).getUTCMonth() === selected)
    .map((r) => ({ id: r.id, category: r.category, text: r.text, inJar: r.inJar }))

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">The Jar</h1>
      <p className="text-gray-500 mb-6">
        A jar for every month. Drag your HYghLights in — watch {year} fill up.
      </p>

      {/* Month strip */}
      <div className="flex flex-wrap gap-2 mb-8">
        {MONTHS.map((m, i) => {
          const on = i === selected
          const pm = perMonth[i]
          return (
            <Link
              key={m}
              href={`/jar?m=${i}`}
              className={`text-sm font-bold rounded-full px-3 py-1.5 border transition-colors ${
                on
                  ? 'bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white border-transparent'
                  : 'bg-white border-gray-100 text-gray-500 hover:border-[#34c5c5]/40'
              }`}
            >
              {m} {pm.total > 0 && <span className={on ? 'opacity-90' : 'text-[#e07800]'}>{pm.jarred}/{pm.total}</span>}
            </Link>
          )
        })}
      </div>

      {monthCards.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 text-center text-gray-500">
          No HYghLights in {FULL[selected]} yet. Capture one on the{' '}
          <Link href="/home" className="text-[#0D9488] font-bold hover:underline">Today</Link> page.
        </div>
      ) : (
        <JarBoard monthLabel={FULL[selected]} initial={monthCards} />
      )}
    </main>
  )
}
