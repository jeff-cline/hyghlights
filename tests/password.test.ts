import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'

describe('password', () => {
  it('hashes and verifies', async () => {
    const h = await hashPassword('TEMP!234')
    expect(h).not.toBe('TEMP!234')
    expect(await verifyPassword('TEMP!234', h)).toBe(true)
    expect(await verifyPassword('wrong', h)).toBe(false)
  })
})
