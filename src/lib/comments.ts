import 'server-only'
import { prisma } from './db'

// Replying to somebody's win.
//
// One level deep and no editing: this is a wall of encouragement, not a forum.
// The two things that genuinely matter here are that a comment can be removed
// by the person who wrote it OR the person whose win it is, and that removal is
// a soft delete — the row stays, so a thread does not reshuffle under somebody
// mid-read and a removal can be accounted for later.

export const COMMENT_MAX = 1000

export type CommentRow = {
  id: string
  fromName: string
  text: string
  createdAt: string
  isMine: boolean
  /** True when the current member may remove it: their comment, or their post. */
  canRemove: boolean
}

/** Comments for a set of highlights, in one query rather than one per post. */
export async function commentsFor(
  highlightIds: string[], currentUserId: string, highlightOwners: Record<string, string>,
): Promise<Record<string, CommentRow[]>> {
  if (highlightIds.length === 0) return {}

  const rows = await prisma.comment.findMany({
    where: { highlightId: { in: highlightIds }, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, highlightId: true, fromUserId: true, fromName: true,
      text: true, createdAt: true,
    },
  }).catch(() => [])

  const out: Record<string, CommentRow[]> = {}
  for (const r of rows) {
    const isMine = r.fromUserId === currentUserId
    const ownsPost = highlightOwners[r.highlightId] === currentUserId
    ;(out[r.highlightId] ??= []).push({
      id: r.id,
      fromName: r.fromName,
      text: r.text,
      createdAt: r.createdAt.toISOString(),
      isMine,
      // The post's author can remove a reply to their own win. Somebody else's
      // words under YOUR story is the one place a person most needs a way out,
      // and asking them to report it and wait is not that.
      canRemove: isMine || ownsPost,
    })
  }
  return out
}

export async function addComment(opts: {
  highlightId: string
  fromUserId: string
  fromEmail: string
  fromName: string
  text: string
}) {
  const text = opts.text.trim().slice(0, COMMENT_MAX)
  if (!text) return null

  // The highlight must exist. Without this a comment can be attached to any id
  // somebody cares to type, including one that was just deleted.
  const exists = await prisma.highlight
    .findUnique({ where: { id: opts.highlightId }, select: { id: true } })
    .catch(() => null)
  if (!exists) return null

  return prisma.comment.create({
    data: {
      highlightId: opts.highlightId,
      fromUserId: opts.fromUserId,
      fromEmail: opts.fromEmail,
      fromName: opts.fromName,
      text,
    },
  }).catch(() => null)
}

/** Remove a comment: the author's own, or any on a post the caller owns. */
export async function removeComment(commentId: string, userId: string): Promise<boolean> {
  const c = await prisma.comment
    .findUnique({
      where: { id: commentId },
      select: { fromUserId: true, deletedAt: true, highlight: { select: { userId: true } } },
    })
    .catch(() => null)
  if (!c || c.deletedAt) return false

  const allowed = c.fromUserId === userId || c.highlight?.userId === userId
  if (!allowed) return false

  const r = await prisma.comment
    .updateMany({ where: { id: commentId, deletedAt: null }, data: { deletedAt: new Date() } })
    .catch(() => ({ count: 0 }))
  return r.count > 0
}

/**
 * Delete one of your own wins.
 *
 * A hard delete, unlike a comment. A comment is part of somebody else's thread
 * and leaves a hole; a highlight is entirely yours, and "I posted that by
 * mistake" deserves it actually being gone. Reactions and comments on it go
 * with it, by the cascade already on those relations.
 *
 * Scoped by userId in the same statement, so it can only ever reach a post the
 * caller wrote — a miss and somebody else's id are the same answer.
 */
export async function deleteHighlight(highlightId: string, userId: string): Promise<boolean> {
  const r = await prisma.highlight
    .deleteMany({ where: { id: highlightId, userId } })
    .catch(() => ({ count: 0 }))
  return r.count > 0
}
