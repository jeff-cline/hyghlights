import type { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyIdentity } from '@/lib/identity'

// HYghLights authenticates against the SHARED account store (the Beyond Limits
// `User` table) via src/lib/identity.ts, so one email + password works on both
// products. The JWT carries the shared userId + email + role.
type AppUser = NextAuthUser & { role: string }

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const identity = await verifyIdentity(String(credentials.email), String(credentials.password))
        if (!identity) return null
        const appUser: AppUser = {
          id: identity.id,
          email: identity.email,
          name: identity.name ?? undefined,
          role: identity.role,
        }
        return appUser
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const appUser = user as AppUser
        token.userId = appUser.id as string
        token.email = appUser.email ?? ''
        token.role = appUser.role
        token.name = appUser.name ?? null
      }
      return token
    },
    async session({ session, token }) {
      session.userId = token.userId as string
      session.email = (token.email as string) ?? session.user?.email ?? ''
      session.role = token.role as string
      return session
    },
  },
}
