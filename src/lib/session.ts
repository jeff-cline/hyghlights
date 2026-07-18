import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const getSession = () => getServerSession(authOptions)

// Resolves the current shared account, or null if not signed in.
export async function requireUser() {
  const session = await getSession()
  if (!session?.userId) return null
  return { userId: session.userId, email: session.email, role: session.role }
}
