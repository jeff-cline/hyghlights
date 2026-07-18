import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getInbox, getSent } from '@/lib/bottles'
import BottleBeach from '@/components/BottleBeach'

export default async function BottlesPage() {
  const user = await requireUser()
  if (!user) redirect('/login')

  const [inbox, sent] = await Promise.all([getInbox(user.email), getSent(user.userId)])

  const toPlain = (b: Awaited<ReturnType<typeof getInbox>>[number]) => ({
    id: b.id,
    fromName: b.fromName,
    fromEmail: b.fromEmail,
    toEmail: b.toEmail,
    message: b.message,
    photoUrl: b.photoUrl,
    openedAt: b.openedAt ? b.openedAt.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
  })

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="inline-flex items-center gap-2 bg-[#34c5c5]/15 text-[#0D9488] rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
        Messages in a bottle
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">The Ocean 🌊</h1>
      <p className="text-gray-500 mb-8">
        Send inspiration across the water, and open what drifts to you.
      </p>
      <BottleBeach inbox={inbox.map(toPlain)} sent={sent.map(toPlain)} />
    </main>
  )
}
