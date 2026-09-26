import type { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyIdentity } from '@/lib/identity'
import {
  registerDevice, isDeviceLive, coarseIp,
  TRUSTED_SECONDS, PUBLIC_SECONDS,
} from '@/lib/devices'
import { notifyNewDevice } from '@/lib/device-email'

// hYghlights authenticates against the SHARED account store (the Beyond Limits
// `User` table) via src/lib/identity.ts, so one email + password works on both
// products. The JWT carries the shared userId + email + role.
//
// STAYING SIGNED IN. Ninety days on a browser somebody has used before, because
// the cookie holding the session is per-browser by construction: a new laptop,
// a different browser, or a private window has no cookie, so it cannot inherit
// anybody's session and must present an email and password. That requirement is
// a property of how this works, not a rule bolted on top.
//
// The length is only responsible because it can be ended early: the token
// carries a Device id, and every request checks that row is still live. Revoke
// it from settings and the session dies within the request, ninety days or not.
type AppUser = NextAuthUser & { role: string; deviceId?: string; trustedFor?: number }

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: TRUSTED_SECONDS,
    // Roll the cookie forward at most daily. Someone who uses the site keeps
    // their ninety days; someone who stops is eventually signed out.
    updateAge: 24 * 60 * 60,
  },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        // "This is a shared or public computer." There is no signal a browser
        // can be asked for that means coffee shop, so the person who does know
        // is asked instead.
        publicComputer: { label: 'Public computer', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null
        const identity = await verifyIdentity(String(credentials.email), String(credentials.password))
        if (!identity) return null

        const headers = new Headers()
        for (const [k, v] of Object.entries(req?.headers ?? {})) {
          if (v != null) headers.set(k, String(v))
        }
        const ua = headers.get('user-agent')
        const ip = coarseIp(headers)

        // Recording the device must NEVER decide whether somebody can sign in.
        //
        // It did once. The Device table was created by hand as the postgres
        // superuser rather than by Prisma as the app role, so the app could not
        // write to it, registerDevice threw, and authorize threw with it —
        // which NextAuth reports as "that email and password did not match".
        // Sign-in was down for everybody, and the error blamed the member's
        // password. The permission is fixed; this makes the shape of that
        // failure impossible rather than merely unlikely.
        //
        // Without a device id the session simply carries none, and the
        // revocation check in the session callback skips. Less safety than
        // intended, which is the correct trade against locking everyone out.
        let deviceId: string | undefined
        try {
          const reg = await registerDevice(identity.id, ua, ip)
          deviceId = reg.deviceId
          if (reg.isNew) notifyNewDevice(identity.email, reg.label, ip).catch(() => {})
        } catch (err) {
          console.error('[auth] device registration failed; signing in anyway:', err)
        }

        const isPublic = String(credentials.publicComputer ?? '') === 'true'

        const appUser: AppUser = {
          id: identity.id,
          email: identity.email,
          name: identity.name ?? undefined,
          role: identity.role,
          deviceId,
          trustedFor: isPublic ? PUBLIC_SECONDS : TRUSTED_SECONDS,
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
        token.deviceId = appUser.deviceId
        // Stamped once at sign-in and never extended. A shared computer stays a
        // shared computer: rolling this forward on activity would quietly turn
        // its eight hours into ninety days.
        token.trustedUntil = Date.now() + (appUser.trustedFor ?? TRUSTED_SECONDS) * 1000
      }
      return token
    },

    async session({ session, token }) {
      const trustedUntil = Number(token.trustedUntil ?? 0)
      if (trustedUntil && Date.now() > trustedUntil) {
        // The shared-computer window has closed. Hand back a session with no
        // identity on it, which every caller already reads as signed out.
        return session
      }

      // The revocation check. This is what makes ninety days defensible.
      const deviceId = token.deviceId as string | undefined
      if (deviceId && !(await isDeviceLive(deviceId))) return session

      session.userId = token.userId as string
      session.email = (token.email as string) ?? session.user?.email ?? ''
      session.role = token.role as string
      session.deviceId = deviceId
      return session
    },
  },
}
