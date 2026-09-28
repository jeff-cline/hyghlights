import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getCommunityFeed } from '@/lib/social'
import { CATEGORY_BY_KEY, categoryLabel } from '@/lib/categories'
import ReactionBar from '@/components/ReactionBar'
import HighlightMedia from '@/components/HighlightMedia'
import ShareOnCardToggle from '@/components/ShareOnCardToggle'
import CommentThread from '@/components/CommentThread'
import DeleteHighlight from '@/components/DeleteHighlight'
import { getOrCreateProfile } from '@/lib/highlights'
import { commentsFor } from '@/lib/comments'
import { prisma } from '@/lib/db'

function fmt(d: string) {
  return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function CommunityPage() {
  const user = await requireUser()
  if (!user) redirect('/login')
  const feed = await getCommunityFeed(user.userId, 60)
  // Needed only so a win ticked for a card that is switched off can say so.
  const profile = await getOrCreateProfile(user.userId, user.email)

  // Who wrote each post, so the thread knows whether the current member may
  // remove a reply sitting under their own win.
  const owners = Object.fromEntries(
    (await prisma.highlight.findMany({
      where: { id: { in: feed.map((h) => h.id) } },
      select: { id: true, userId: true },
    }).catch(() => [])).map((h) => [h.id, h.userId]),
  )
  // One query for every thread on the page rather than one per post.
  const threads = await commentsFor(feed.map((h) => h.id), user.userId, owners)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="inline-flex items-center gap-2 bg-[#34c5c5]/15 text-[#0D9488] rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
        The wins wall
      </div>
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">Community</h1>
      <p className="text-gray-500 mb-8">Celebrate each other. Every win deserves a high-five 🙌.</p>

      {feed.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center text-gray-500">
          No hYghlights yet — be the first to share a win.
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
                <HighlightMedia photoUrl={h.photoUrl} videoUrl={h.videoUrl} />
                <ReactionBar highlightId={h.id} counts={h.counts} mine={h.mine} />
                {h.isMine && (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <ShareOnCardToggle highlightId={h.id} initial={h.isShareable}
                                       cardPublic={profile.cardPublic} />
                    <DeleteHighlight highlightId={h.id} />
                  </div>
                )}
                <CommentThread highlightId={h.id} initial={threads[h.id] ?? []} />
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
