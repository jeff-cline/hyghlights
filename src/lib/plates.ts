import { prisma } from '@/lib/db'

export async function getPlates(userId: string) {
  const [active, done] = await Promise.all([
    prisma.plate.findMany({ where: { userId, status: 'active' }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
    prisma.plate.findMany({ where: { userId, status: 'done' }, orderBy: { completedAt: 'desc' } }),
  ])
  return { active, done }
}

export async function createPlate(userId: string, email: string, input: {
  title: string
  category?: string | null
  startDate?: string | null
  dueDate?: string | null
  notes?: string | null
}) {
  const min = await prisma.plate.aggregate({ where: { userId, status: 'active' }, _min: { sortOrder: true } })
  const sortOrder = (min._min.sortOrder ?? 0) - 1 // new plates float to the top
  return prisma.plate.create({
    data: {
      userId,
      email,
      title: input.title.trim().slice(0, 200),
      category: input.category ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      notes: input.notes?.trim() || null,
      sortOrder,
    },
  })
}

// Owner-scoped update. Toggling to done stamps completedAt (→ Master
// Accomplishments); reactivating clears it.
export async function updatePlate(userId: string, id: string, patch: {
  title?: string
  notes?: string | null
  status?: 'active' | 'done'
  dueDate?: string | null
  startDate?: string | null
  sortOrder?: number
}) {
  const data: Record<string, unknown> = {}
  if (patch.title !== undefined) data.title = patch.title.trim().slice(0, 200)
  if (patch.notes !== undefined) data.notes = patch.notes?.trim() || null
  if (patch.dueDate !== undefined) data.dueDate = patch.dueDate ? new Date(patch.dueDate) : null
  if (patch.startDate !== undefined) data.startDate = patch.startDate ? new Date(patch.startDate) : null
  if (patch.sortOrder !== undefined) data.sortOrder = patch.sortOrder
  if (patch.status !== undefined) {
    data.status = patch.status
    data.completedAt = patch.status === 'done' ? new Date() : null
  }
  const res = await prisma.plate.updateMany({ where: { id, userId }, data })
  return res.count > 0
}

export async function deletePlate(userId: string, id: string) {
  const res = await prisma.plate.deleteMany({ where: { id, userId } })
  return res.count > 0
}

// Persist a new top-to-bottom order of active plate ids.
export async function reorderPlates(userId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, i) => prisma.plate.updateMany({ where: { id, userId }, data: { sortOrder: i } })),
  )
}
