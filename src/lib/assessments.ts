import { prisma } from '@/lib/db'
import { QUIZ_BY_KEY, scoreQuiz } from '@/lib/quizzes'

export async function saveAssessment(userId: string, email: string, quizKey: string, answers: number[]) {
  const quiz = QUIZ_BY_KEY[quizKey]
  if (!quiz) throw new Error('unknown quiz')
  const resultKey = scoreQuiz(quiz, answers)
  const resultLabel = quiz.results[resultKey]?.label ?? resultKey
  return prisma.assessment.upsert({
    where: { userId_quizKey: { userId, quizKey } },
    update: { resultKey, resultLabel, completedAt: new Date() },
    create: { userId, email, quizKey, resultKey, resultLabel },
  })
}

export async function getMyAssessments(userId: string) {
  const rows = await prisma.assessment.findMany({ where: { userId } })
  const byQuiz: Record<string, { resultKey: string; resultLabel: string; completedAt: Date }> = {}
  for (const r of rows) byQuiz[r.quizKey] = { resultKey: r.resultKey, resultLabel: r.resultLabel, completedAt: r.completedAt }
  return byQuiz
}
