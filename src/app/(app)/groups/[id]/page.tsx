import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { requireUser } from '@/lib/session'
import { getGroup, getGroupFeed } from '@/lib/groups'
import { CATEGORY_BY_KEY, categoryLabel } from '@/lib/categories'
import ReactionBar from '@/components/ReactionBar'
import GroupActions from '@/components/GroupActions'

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) redirect('/login')
  const { id } = await params

  const group = await getGroup(id, user.userId)
  if (!group) notFound()
  const feed = await getGroupFeed(id, user.userId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/groups" className="text-sm font-bold text-[#0D9488] hover:underline">← All groups</Link>

      <div className="flex items-start justify-between mt-4 mb-2 gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-gray-800">{group.name}</h1>
      </div>
      <div className="mb-6">
        <GroupActions groupId={group.id} inviteCode={group.inviteCode} />
      </div>
      <p className="text-gray-500 text-sm mb-8">
        {group.members.length} member{group.members.length === 1 ? '' : 's'} celebrating together.
      </p>

      {feed.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center text-gray-500">
          No HYghLights in this circle yet — share the first win.
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((h) => {
            const c = CATEGORY_BY_KEY[h.category]
            return (
              <div key={h.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-black text-gray-800">{h.isMine ? 'You' : h.author}</span>
                  <span className="text-sm font-bold" style={{ color: c?.color ?? '#e07800' }}>
                    · {c?.emoji} {categoryLabel(h.category)}
                  </span>
                  <span className="text-gray-400 text-xs">· {fmt(h.createdAt)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">{h.text}</p>
                <ReactionBar highlightId={h.id} counts={h.counts} mine={h.mine} />
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
