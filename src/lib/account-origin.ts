// Which product an account was born in.
//
// HYghLights and Beyond Limits share one `User` row, so "do you have an
// account" is the same question on both sites. "Where did you come from" is
// not, and it decides what we say to someone:
//
//   born on Beyond Limits  → "you already have a single sign-on, welcome"
//   born on HYghLights     → "join Beyond Limits, 10% off"
//
// Getting it backwards means offering a discount to somebody who is already
// paying, or welcoming somebody to a product they have never heard of.
//
// The signal already exists in the data: createIdentity() stamps
// `hy_<uuid>` on accounts it makes, and Beyond Limits' Prisma schema uses
// cuid(), which never starts with that. No migration, no new column, and it is
// true retroactively for every account either product has ever created.

/** The prefix createIdentity() writes. See src/lib/identity.ts. */
export const HYGHLIGHTS_ID_PREFIX = 'hy_'

export type AccountOrigin = 'hyghlights' | 'beyondlimits'

/**
 * Where this account was created.
 *
 * Anything that is not clearly ours is treated as Beyond Limits, because that
 * is where every account came from before HYghLights could create one — and
 * because the failure modes are not equal. Mistaking a Beyond Limits member
 * for a newcomer offers them a discount on something they already pay for;
 * mistaking a newcomer for a member welcomes them to a product they have never
 * seen. The first is embarrassing, the second is confusing, and defaulting
 * this way makes neither happen to the accounts that actually exist today.
 */
export function accountOrigin(userId: string | null | undefined): AccountOrigin {
  const id = String(userId ?? '')
  return id.startsWith(HYGHLIGHTS_ID_PREFIX) ? 'hyghlights' : 'beyondlimits'
}

/** True when this person already belongs to Beyond Limits Bootcamp. */
export function isBeyondLimitsMember(userId: string | null | undefined): boolean {
  return accountOrigin(userId) === 'beyondlimits'
}

/**
 * What to say to somebody whose email already has an account.
 *
 * The signup route used to answer every collision with "that email already has
 * an account — just sign in", which is true and tells a Beyond Limits member
 * nothing about why. One account across both products is the point of the
 * thing, so the collision is the best moment to say so.
 */
export const SSO_WELCOME_TITLE = "You're already a member of Beyond Limits Bootcamp."
export const SSO_WELCOME_BODY =
  'You have a single sign-on for HYghLights — the same email and password work here. ' +
  'Welcome to the journey.'

/** Said to someone whose account was created here, so it must not mention SSO. */
export const PLAIN_EXISTS_MESSAGE = 'That email already has an account — just sign in.'
