import { prisma } from '@/lib/db'

export async function sendBottle(input: {
  fromUserId: string
  fromEmail: string
  fromName: string | null
  toEmail: string
  message: string
  photoUrl?: string | null
}) {
  return prisma.bottle.create({
    data: {
      fromUserId: input.fromUserId,
      fromEmail: input.fromEmail,
      fromName: input.fromName,
      toEmail: input.toEmail.toLowerCase().trim(),
      message: input.message.trim().slice(0, 4000),
      photoUrl: input.photoUrl ?? null,
    },
  })
}

// Bottles that washed up for me (by email).
export async function getInbox(email: string) {
  return prisma.bottle.findMany({
    where: { toEmail: email.toLowerCase().trim() },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })
}

// Bottles I've sent out into the ocean.
export async function getSent(userId: string) {
  return prisma.bottle.findMany({
    where: { fromUserId: userId },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })
}

export async function openBottle(id: string, email: string) {
  const bottle = await prisma.bottle.findUnique({ where: { id } })
  if (!bottle || bottle.toEmail !== email.toLowerCase().trim()) return null
  if (!bottle.openedAt) {
    return prisma.bottle.update({ where: { id }, data: { openedAt: new Date() } })
  }
  return bottle
}

export async function unopenedCount(email: string) {
  return prisma.bottle.count({ where: { toEmail: email.toLowerCase().trim(), openedAt: null } })
}
