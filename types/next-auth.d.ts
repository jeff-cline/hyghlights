// Session/JWT augmentation for hYghlights. Accounts are shared with Beyond
// Limits (see src/lib/identity.ts); we carry the shared userId + email + role.
//
// `userId` is optional on Session because a session whose device has been
// revoked, or whose shared-computer window has closed, comes back without one —
// which is how every caller already reads "signed out".
declare module 'next-auth' {
  interface Session {
    userId?: string
    email: string
    role: string
    /** Which browser this session belongs to, so it can be signed out by name. */
    deviceId?: string
  }

  interface User {
    role: string
    deviceId?: string
    /** Seconds this sign-in is good for: 90 days, or 8 hours if shared. */
    trustedFor?: number
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    email: string
    role: string
    name: string | null
    deviceId?: string
    /** Stamped once at sign-in and never extended. */
    trustedUntil?: number
  }
}

export {}
