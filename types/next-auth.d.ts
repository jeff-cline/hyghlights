// Session/JWT augmentation for HYghLights. Accounts are shared with Beyond
// Limits (see src/lib/identity.ts); we carry the shared userId + email + role.
declare module 'next-auth' {
  interface Session {
    userId: string
    email: string
    role: string
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    email: string
    role: string
    name: string | null
  }
}

export {}
