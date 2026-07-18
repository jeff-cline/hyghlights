import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'
import type { FeedItem, ReactionType } from '@/lib/social'

function newCode() {
  return randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
}

export async function createGroup(userId: string, email: string, name: string) {
  const group = await prisma.group.create({
    data: {
      name: name.trim().slice(0, 80) || 'My Circle',
      ownerId: userId,
      inviteCode: newCode(),
      members: { create: { userId, email } },
    },
  })
  return group
}

export async function joinByCode(userId: string, email: string, code: string) {
  const group = await prisma.group.findUnique({ where: { inviteCode: code.trim().toUpperCase() } })
  if (!group) return null
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId } },
    update: {},
    create: { groupId: group.id, userId, email },
  })
  return group
}

export async function leaveGroup(userId: string, groupId: string) {
  await prisma.groupMember.deleteMany({ where: { groupId, userId } })
}

export async function getMyGroups(userId: string) {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: { group: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: 'desc' },
  })
  return memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    inviteCode: m.group.inviteCode,
    memberCount: m.group._count.members,
    isOwner: m.group.ownerId === userId,
  }))
}

export async function getGroup(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })
  if (!group) return null
  const isMember = group.members.some((m) => m.userId === userId)
  if (!isMember) return null
  return {
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    isOwner: group.ownerId === userId,
    members: group.members.map((m) => ({ userId: m.userId, email: m.email })),
  }
}

// Highlights from everyone in the group, with reaction tallies + which ones the
// viewer gave (same shape as the community feed).
export async function getGroupFeed(groupId: string, userId: string, limit = 60): Promise<FeedItem[]> {
  const members = await prisma.groupMember.findMany({ where: { groupId }, select: { userId: true } })
  const memberIds = members.map((m) => m.userId)
  if (memberIds.length === 0) return []

  const highlights = await prisma.highlight.findMany({
    where: { userId: { in: memberIds } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { reactions: true },
  })
  const profiles = await prisma.profile.findMany({
    where: { userId: { in: memberIds } },
    select: { userId: true, displayName: true, email: true },
  })
  const nameByUser: Record<string, string> = {}
  for (const p of profiles) nameByUser[p.userId] = p.displayName || p.email.split('@')[0]

  return highlights.map((h) => {
    const counts = { HIGHFIVE: 0, BALLOON: 0, DANCEPARTY: 0 } as Record<ReactionType, number>
    const mine: ReactionType[] = []
    for (const r of h.reactions) {
      const t = r.type as ReactionType
      if (counts[t] === undefined) continue
      counts[t]++
      if (r.fromUserId === userId) mine.push(t)
    }
    return {
      id: h.id,
      author: nameByUser[h.userId] ?? h.email.split('@')[0],
      isMine: h.userId === userId,
      category: h.category,
      text: h.text,
      photoUrl: h.photoUrl,
      videoUrl: h.videoUrl,
      createdAt: h.createdAt.toISOString(),
      counts,
      mine,
    }
  })
}
