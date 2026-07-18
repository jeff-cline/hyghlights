import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'

export default async function GroupsPage() {
  const user = await requireUser()
  if (!user) redirect('/login')
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">Groups</h1>
      <p className="text-gray-500 mb-8">
        Circles of family, friends, and partners who honor each other&apos;s highlights — with high-fives 🙌,
        balloons 🎈, and dance parties 🕺.
      </p>
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center text-gray-500">
        Small groups and the message-in-a-bottle share are the next build. Your highlights are ready for them.
      </div>
    </main>
  )
}
