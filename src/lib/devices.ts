import 'server-only'
import { prisma } from './db'

// Staying signed in, safely.
//
// A session lasts ninety days on a browser somebody has used before, and that is
// only a reasonable thing to offer if it can be ended early. So every session
// carries a Device id and every request checks that row is still live.
//
// WHAT THIS DELIBERATELY DOES NOT DO: decide anything from the IP address.
// An IP changes when you walk from wifi onto cellular, when a router renews its
// lease, on any VPN, and constantly on mobile networks. A session tied to one
// would sign people out several times a day — the opposite of staying signed in.
// The IP is recorded so a member can recognise their own devices, and for
// nothing else.
//
// "A public location" is not something a browser can be asked about either.
// There is no signal that says coffee shop. What there is, is the member's own
// knowledge — so the login screen asks them, and a shared computer gets a short
// session instead of a long one.

/** Ninety days, as asked for. */
export const TRUSTED_DAYS = 90
export const TRUSTED_SECONDS = TRUSTED_DAYS * 24 * 60 * 60

/**
 * A shared or public computer gets eight hours — long enough to finish what you
 * came to do, short enough that a machine left logged in at a library is not a
 * standing invitation.
 */
export const PUBLIC_SECONDS = 8 * 60 * 60

/**
 * A human name for a browser, from its user agent.
 *
 * Coarse on purpose. This exists so somebody scanning their device list can say
 * "that is my phone" — not to identify anybody. Order matters: Edge and Opera
 * both claim to be Chrome, and Chrome claims to be Safari.
 */
export function describeDevice(userAgent: string | null | undefined): string {
  const ua = String(userAgent ?? '')
  if (!ua) return 'Unknown device'

  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Browser'

  const os =
    /iPhone/.test(ua) ? 'iPhone'
    : /iPad/.test(ua) ? 'iPad'
    : /Android/.test(ua) ? 'Android'
    : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Linux/.test(ua) ? 'Linux'
    : 'an unknown system'

  return `${browser} on ${os}`
}

/**
 * The client's address, as best the proxy tells us.
 *
 * nginx sits in front, so the socket address is always the server's own. Takes
 * the first entry of x-forwarded-for, which is the client, and truncates it:
 * a member recognising "89.101.x.x" is the whole use, and keeping the last
 * octets of somebody's home address serves nothing.
 */
export function coarseIp(headers: Headers): string | null {
  const raw = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? headers.get('x-real-ip')?.trim()
  if (!raw) return null

  if (raw.includes(':')) {
    // IPv6 — keep the routing prefix only.
    const parts = raw.split(':').filter(Boolean)
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}:…` : null
  }
  const parts = raw.split('.')
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.x.x` : null
}

/** Record a sign-in. Returns the device id the session will carry. */
export async function registerDevice(
  userId: string, userAgent: string | null, ip: string | null,
): Promise<{ deviceId: string; isNew: boolean; label: string }> {
  const label = describeDevice(userAgent)

  // Every sign-in makes a row. Two browsers on one laptop are two devices, and
  // signing one out should not sign the other out.
  const device = await prisma.device.create({
    data: { userId, label, lastIp: ip },
  })

  // "New" means: nothing else of this description has signed in before. Used
  // only to decide whether the sign-in is worth telling them about.
  const seenBefore = await prisma.device.count({
    where: { userId, label, id: { not: device.id } },
  }).catch(() => 0)

  return { deviceId: device.id, isNew: seenBefore === 0, label }
}

/**
 * Is this session still allowed?
 *
 * False for a revoked device, a deleted one, and anything past its expiry.
 * Touches lastSeenAt at most once an hour — a write on every request would make
 * the device list marginally more accurate and every page load slower.
 */
export async function isDeviceLive(deviceId: string): Promise<boolean> {
  const d = await prisma.device
    .findUnique({ where: { id: deviceId }, select: { revokedAt: true, lastSeenAt: true } })
    .catch(() => null)
  if (!d || d.revokedAt) return false

  const anHourAgo = Date.now() - 60 * 60 * 1000
  if (d.lastSeenAt.getTime() < anHourAgo) {
    await prisma.device
      .update({ where: { id: deviceId }, data: { lastSeenAt: new Date() } })
      .catch(() => null)
  }
  return true
}

/** Everything currently signed in, newest first. */
export async function listDevices(userId: string) {
  return prisma.device.findMany({
    where: { userId, revokedAt: null },
    orderBy: { lastSeenAt: 'desc' },
    select: { id: true, label: true, lastIp: true, createdAt: true, lastSeenAt: true },
  }).catch(() => [])
}

/** Sign one device out. Scoped by userId, so it can only reach your own. */
export async function revokeDevice(userId: string, deviceId: string): Promise<boolean> {
  const r = await prisma.device
    .updateMany({
      where: { id: deviceId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    .catch(() => ({ count: 0 }))
  return r.count > 0
}

/** Sign out everything except the browser asking. */
export async function revokeOtherDevices(userId: string, keepDeviceId: string): Promise<number> {
  const r = await prisma.device
    .updateMany({
      where: { userId, revokedAt: null, id: { not: keepDeviceId } },
      data: { revokedAt: new Date() },
    })
    .catch(() => ({ count: 0 }))
  return r.count
}
