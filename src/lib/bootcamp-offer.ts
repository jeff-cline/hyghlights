// The Beyond Limits Bootcamp offer, in one place.
//
// Beyond Limits is the business — membership, monthly fees, corporate sales.
// hYghlights is the social layer that spans it and other brands. This is the
// seam between the two: somebody who joins hYghlights on its own is somebody
// who has not yet met the product that charges money, and this is what we say
// to them.
//
// The coupon is only a name here. Beyond Limits owns what HYGHLIGHTS is worth,
// whether it is still live, and who is allowed to use it — and re-checks all
// three when it is redeemed. Nothing about the discount is decided on this side,
// so the two cannot drift into disagreeing about the price.

/** Must match the Coupon row in the Beyond Limits database. */
export const BOOTCAMP_COUPON = 'HYGHLIGHTS'

export const BOOTCAMP_URL =
  process.env.BOOTCAMP_URL?.replace(/\/+$/, '') || 'https://beyondlimitsbootcamp.com'

export const BOOTCAMP_OFFER = {
  headline: 'Join Beyond Limits Bootcamp',
  sub: 'Make the Shift',
  discount: '10% off',
  code: BOOTCAMP_COUPON,
  /** Carries the code so the discount is applied without anyone typing it. */
  href: `${BOOTCAMP_URL}/signup?coupon=${BOOTCAMP_COUPON}`,
} as const

/**
 * Both products this one password unlocks.
 *
 * Named in the plural wherever a password is set or reset. setIdentityPassword()
 * rewrites a single shared row, so a reset begun on either site silently changes
 * the other — and somebody who does not know that has not really consented to
 * it. Saying it costs one line and prevents "why did my Bootcamp login stop
 * working" entirely.
 */
export const SHARED_ACCOUNT_PRODUCTS = ['hYghlights', 'Beyond Limits Bootcamp'] as const

export const SHARED_PASSWORD_NOTICE =
  'One password covers both hYghlights and Beyond Limits Bootcamp. ' +
  'Changing it here changes it for both.'
