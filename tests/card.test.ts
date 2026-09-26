import { describe, it, expect } from 'vitest'
import {
  slugifyName, slugCandidates, isValidSlug, cardPath, cardUrl,
  shareText, SHARE_TARGETS, SLUG_MAX,
} from '@/lib/card'

describe('turning a name into a slug', () => {
  it('makes firstname-lastname', () => {
    expect(slugifyName('Krystalore Crews')).toBe('krystalore-crews')
    expect(slugifyName('Jeff Cline')).toBe('jeff-cline')
  })

  it('collapses extra spacing and trims', () => {
    expect(slugifyName('  Jeff   Cline  ')).toBe('jeff-cline')
  })

  it('keeps an apostrophe name readable', () => {
    // o-brien would look like two names.
    expect(slugifyName("Aoife O'Brien")).toBe('aoife-obrien')
    expect(slugifyName('Aoife O’Brien')).toBe('aoife-obrien')
  })

  it('keeps letters from other scripts rather than erasing the name', () => {
    expect(slugifyName('Renée Dubois')).toBe('renee-dubois')
    expect(slugifyName('李 明').length).toBeGreaterThan(0)
  })

  it('drops punctuation without leaving stray hyphens', () => {
    expect(slugifyName('Dr. Sam Patel, PhD')).toBe('dr-sam-patel-phd')
    expect(slugifyName('!!!Jeff!!!')).toBe('jeff')
  })

  it('is empty for a name that has nothing usable in it', () => {
    expect(slugifyName('')).toBe('')
    expect(slugifyName(null)).toBe('')
    expect(slugifyName('---')).toBe('')
  })

  it('never exceeds the length cap or ends in a hyphen', () => {
    const s = slugifyName('a'.repeat(200) + ' ' + 'b'.repeat(200))
    expect(s.length).toBeLessThanOrEqual(SLUG_MAX)
    expect(s.endsWith('-')).toBe(false)
  })
})

describe('handling two people with the same name', () => {
  it('offers the plain slug first, then numbers', () => {
    const c = slugCandidates('Jeff Cline')
    expect(c[0]).toBe('jeff-cline')
    expect(c[1]).toBe('jeff-cline-2')
    expect(c[2]).toBe('jeff-cline-3')
  })

  it('never offers a reserved word as somebody’s card', () => {
    // A member called "Settings" must not take /my-card/settings.
    expect(slugCandidates('Settings')).not.toContain('settings')
    expect(slugCandidates('Admin')).not.toContain('admin')
  })

  it('offers nothing when there is no usable name', () => {
    expect(slugCandidates('')).toEqual([])
  })
})

describe('validating a stored slug', () => {
  it('accepts what slugifyName produces', () => {
    expect(isValidSlug('krystalore-crews')).toBe(true)
    expect(isValidSlug('jeff-cline-2')).toBe(true)
  })

  it('rejects reserved words and malformed slugs', () => {
    expect(isValidSlug('settings')).toBe(false)
    expect(isValidSlug('')).toBe(false)
    expect(isValidSlug('-leading')).toBe(false)
    expect(isValidSlug('trailing-')).toBe(false)
    expect(isValidSlug('two--hyphens')).toBe(false)
    expect(isValidSlug('has space')).toBe(false)
    expect(isValidSlug('a'.repeat(SLUG_MAX + 1))).toBe(false)
  })

  it('rejects a path traversal dressed up as a slug', () => {
    expect(isValidSlug('../admin')).toBe(false)
    expect(isValidSlug('a/b')).toBe(false)
  })
})

describe('the URL', () => {
  it('builds the path and the absolute link the same way', () => {
    expect(cardPath('jeff-cline')).toBe('/my-card/jeff-cline')
    expect(cardUrl('jeff-cline')).toBe('https://hyghlights.com/my-card/jeff-cline')
  })

  it('does not double the slash when the origin has a trailing one', () => {
    expect(cardUrl('jeff-cline', 'https://hyghlights.com/')).toBe(
      'https://hyghlights.com/my-card/jeff-cline')
  })
})

describe('share targets', () => {
  it('offers somewhere to share and a way to copy', () => {
    expect(SHARE_TARGETS.length).toBeGreaterThanOrEqual(5)
    expect(SHARE_TARGETS.some((t) => t.key === 'copy')).toBe(true)
  })

  it('encodes the url into every outbound link', () => {
    const url = cardUrl('jeff-cline')
    for (const t of SHARE_TARGETS) {
      const href = t.href(url, 'hello')
      if (href === null) continue // copy / native share
      expect(href).toContain(encodeURIComponent(url))
    }
  })

  it('names the person and their why in the share text', () => {
    expect(shareText('Krystalore', 'To be the reason someone keeps going'))
      .toBe('Krystalore’s wins on hYghlights — “To be the reason someone keeps going”')
  })

  it('still reads properly with no name or no why', () => {
    expect(shareText(null)).toBe('My wins on hYghlights')
    expect(shareText('Jeff')).toBe('Jeff’s wins on hYghlights')
  })
})
