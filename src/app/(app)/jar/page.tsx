import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/db'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function JarPage() {
  const user = await requireUser()
  if (!user) redirect('/login')

  const highlights = await prisma.highlight.findMany({
    where: { userId: user.userId },
    select: { entryDate: true },
  })
  const counts = new Array(12).fill(0)
  for (const h of highlights) counts[new Date(h.entryDate).getUTCMonth()]++

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-black text-white mb-1">The Jar</h1>
      <p className="text-white/50 mb-8">
        A jar for every month. Each highlight you capture drops in — watch the year fill up.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {MONTHS.map((m, i) => (
          <div key={m} className="bg-[#15151a] border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">{counts[i] > 0 ? '🫙' : '🫙'}</div>
            <div className="font-black text-white">{m}</div>
            <div className="text-[#C9A24B] font-bold text-sm">{counts[i]} inside</div>
          </div>
        ))}
      </div>
      <p className="text-white/30 text-sm mt-8 text-center">
        Drag-and-drop cards, monthly recaps, and the message-in-a-bottle share are coming next.
      </p>
    </main>
  )
}
