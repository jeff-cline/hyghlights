import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/session'
import { saveAssessment } from '@/lib/assessments'

const schema = z.object({
  quizKey: z.string().min(1),
  answers: z.array(z.number().int().min(0).max(9)).min(1).max(20),
})

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Answer every question.' }, { status: 400 })
  try {
    const a = await saveAssessment(user.userId, user.email, parsed.data.quizKey, parsed.data.answers)
    return NextResponse.json({ resultKey: a.resultKey, resultLabel: a.resultLabel })
  } catch {
    return NextResponse.json({ error: 'Unknown quiz.' }, { status: 400 })
  }
}
