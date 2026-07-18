import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { createPlate, updatePlate, deletePlate, reorderPlates } from '@/lib/plates'

const createSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

const patchSchema = z.union([
  z.object({ orderedIds: z.array(z.string()).max(200) }),
  z.object({
    id: z.string().min(1),
    title: z.string().max(200).optional(),
    notes: z.string().max(2000).optional().nullable(),
    status: z.enum(['active', 'done']).optional(),
    dueDate: z.string().optional().nullable(),
    startDate: z.string().optional().nullable(),
  }),
])

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Name the plate.' }, { status: 400 })
  const plate = await createPlate(user.userId, user.email, parsed.data)
  return NextResponse.json({ plate: { id: plate.id } })
}

export async function PATCH(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid.' }, { status: 400 })
  if ('orderedIds' in parsed.data) {
    await reorderPlates(user.userId, parsed.data.orderedIds)
  } else {
    const { id, ...patch } = parsed.data
    const ok = await updatePlate(user.userId, id, patch)
    if (!ok) return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const { id } = (await req.json().catch(() => ({}))) as { id?: string }
  if (!id) return NextResponse.json({ error: 'Invalid.' }, { status: 400 })
  await deletePlate(user.userId, id)
  return NextResponse.json({ ok: true })
}
