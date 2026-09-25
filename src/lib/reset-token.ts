import crypto from 'crypto'

// Signed, stateless password-reset tokens. One hour.
//
// Deliberately the same scheme Beyond Limits uses, because the two products
// share one account and a reset on either has to mean the same thing. Nothing
// is stored: the token carries the address and an expiry, and the signature is
// what makes it trustworthy. A token cannot be revoked early, which is the
// price of not having a table — acceptable for a one-hour window on a link
// that only ever reaches the address it is about.

const SECRET =
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'hyghlights-dev-secret'

export function signReset(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.toLowerCase(), purpose: 'reset', exp: Date.now() + 3_600_000 }),
  ).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyReset(token: string): { email: string } | null {
  if (!token || !token.includes('.')) return null
  const [p, sig] = token.split('.')
  const good = crypto.createHmac('sha256', SECRET).update(p).digest('base64url')
  try {
    // Constant-time, so a wrong signature cannot be found a byte at a time.
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null
  } catch {
    // Different lengths make timingSafeEqual throw. Also a failure.
    return null
  }
  try {
    const o = JSON.parse(Buffer.from(p, 'base64url').toString()) as {
      email?: string; purpose?: string; exp?: number
    }
    if (o.purpose !== 'reset' || !o.email || (o.exp && Date.now() > o.exp)) return null
    return { email: o.email }
  } catch {
    return null
  }
}
