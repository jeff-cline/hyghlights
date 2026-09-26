import { describe, it, expect } from 'vitest'
import {
  accountOrigin, isBeyondLimitsMember, HYGHLIGHTS_ID_PREFIX,
} from '@/lib/account-origin'

// One User row serves both products, so origin is the only thing separating
// "welcome, you already have a single sign-on" from "join Beyond Limits, 10%
// off". Offering a discount to a paying member is the failure this prevents.

describe('where an account was born', () => {
  it('recognises an account HYghLights created', () => {
    expect(accountOrigin('hy_3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe('hyghlights')
    expect(isBeyondLimitsMember('hy_3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe(false)
  })

  it('recognises a Beyond Limits cuid', () => {
    // A real one, from the shared User table.
    expect(accountOrigin('cmr8k2p9x0000abcd1234efgh')).toBe('beyondlimits')
    expect(isBeyondLimitsMember('cmr8k2p9x0000abcd1234efgh')).toBe(true)
  })

  it('treats anything unrecognised as Beyond Limits', () => {
    // Every account predating HYghLights signup came from there, and welcoming
    // a stranger to a product they have never seen is worse than the reverse.
    expect(accountOrigin('')).toBe('beyondlimits')
    expect(accountOrigin(null)).toBe('beyondlimits')
    expect(accountOrigin(undefined)).toBe('beyondlimits')
    expect(accountOrigin('some-legacy-id')).toBe('beyondlimits')
  })

  it('is not fooled by the prefix appearing later in the id', () => {
    expect(accountOrigin('cmrhy_notaprefix')).toBe('beyondlimits')
  })

  it('matches the prefix identity.ts actually writes', () => {
    expect(HYGHLIGHTS_ID_PREFIX).toBe('hy_')
  })
})
