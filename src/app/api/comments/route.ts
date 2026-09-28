import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { getOrCreateProfile } from '@/lib/highlights'
import { addComment, removeComment, COMMENT_MAX } from '@/lib/comments'

const postSchema = z.object({
  highlightId: z.string().min(1).max(64),
  text: z.string().min(1).max(COMMENT_MAX),
})
const deleteSchema = z.object({ commentId: z.string().min(1).max(64) })

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const parsed = postSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Write something first.' }, { status: 400 })
  }

  const profile = await getOrCreateProfile(user.userId, user.email)
  const c = await addComment({
    highlightId: parsed.data.highlightId,
    fromUserId: user.userId,
    fromEmail: user.email,
    fromName: profile.displayName?.trim() || user.email.split('@')[0],
    text: parsed.data.text,
  })
  if (!c) return NextResponse.json({ error: 'That win could not be found.' }, { status: 404 })

  return NextResponse.json({
    ok: true,
    comment: {
      id: c.id, fromName: c.fromName, text: c.text,
      createdAt: c.createdAt.toISOString(), isMine: true, canRemove: true,
    },
  })
}

export async function DELETE(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })

  // removeComment decides who is allowed — the comment's author, or the owner
  // of the win it sits under. Not allowed and not found are the same answer.
  const ok = await removeComment(parsed.data.commentId, user.userId)
  if (!ok) return NextResponse.json({ error: 'That comment could not be removed.' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
