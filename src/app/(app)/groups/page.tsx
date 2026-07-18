import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { getMyGroups } from '@/lib/groups'
import GroupsManager from '@/components/GroupsManager'

export default async function GroupsPage() {
  const user = await requireUser()
  if (!user) redirect('/login')
  const groups = await getMyGroups(user.userId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">Groups</h1>
      <p className="text-gray-500 mb-8">
        Circles of family, friends, and partners who honor each other&apos;s highlights — high-fives 🙌,
        balloons 🎈, and dance parties 🕺.
      </p>

      {groups.length > 0 && (
        <div className="space-y-3 mb-10">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4 hover:border-[#34c5c5]/40 transition-colors"
            >
              <div>
                <div className="font-black text-gray-800">{g.name}</div>
                <div className="text-gray-400 text-sm">
                  {g.memberCount} member{g.memberCount === 1 ? '' : 's'}
                  {g.isOwner && <span className="text-[#0D9488] font-bold"> · owner</span>}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-[#F4F1EC] rounded-full px-3 py-1 tracking-widest">{g.inviteCode}</span>
            </Link>
          ))}
        </div>
      )}

      <GroupsManager />
    </main>
  )
}
