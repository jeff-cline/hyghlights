import { describe, it, expect } from 'vitest'
import {
  PEACE_PLACES, MAX_PEACE_PLACES, PEACE_PLACE_MAX_CHARS,
  formatPeacePlaces, parsePeacePlaces, isPresetPlace,
  emojiForPlace, placesWithIcons,
} from '@/lib/peace-places'

describe('the menu', () => {
  it('shows at least a dozen, which is the point of the change', () => {
    expect(PEACE_PLACES.length).toBeGreaterThanOrEqual(12)
  })

  it('gives every option an emoji and a label', () => {
    for (const p of PEACE_PLACES) {
      expect(p.emoji.length).toBeGreaterThan(0)
      expect(p.label.trim().length).toBeGreaterThan(0)
    }
  })

  it('has no duplicate labels', () => {
    const keys = PEACE_PLACES.map((p) => p.label.toLocaleLowerCase())
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('storing a selection', () => {
  it('joins what they picked', () => {
    expect(formatPeacePlaces(['The beach', 'At sunrise'])).toBe('The beach, At sunrise')
  })

  it('caps at the maximum', () => {
    const many = PEACE_PLACES.slice(0, MAX_PEACE_PLACES + 3).map((p) => p.label)
    expect(parsePeacePlaces(formatPeacePlaces(many))).toHaveLength(MAX_PEACE_PLACES)
  })

  it('de-duplicates regardless of case — the menu and the text box overlap', () => {
    expect(formatPeacePlaces(['A long bath', 'a long bath'])).toBe('A long bath')
  })

  it('drops blanks and collapses whitespace', () => {
    expect(formatPeacePlaces(['  The   beach ', '', '   '])).toBe('The beach')
  })

  it('never exceeds the column limit, even with a rambling custom entry', () => {
    const long = 'x'.repeat(400)
    const out = formatPeacePlaces(['The beach', long])
    expect(out.length).toBeLessThanOrEqual(PEACE_PLACE_MAX_CHARS)
    // The entry that would not fit is dropped whole, not cut in half.
    expect(out).toBe('The beach')
  })

  it('is empty when nothing was chosen', () => {
    expect(formatPeacePlaces([])).toBe('')
    expect(formatPeacePlaces(['', '  '])).toBe('')
  })
})

describe('reading a stored value back', () => {
  it('round-trips a multi-selection', () => {
    const picked = ['The beach', 'On a walk', 'With my coffee']
    expect(parsePeacePlaces(formatPeacePlaces(picked))).toEqual(picked)
  })

  it('turns a pre-existing single answer into a list of one', () => {
    // What every profile onboarded before this change actually holds.
    expect(parsePeacePlaces('The beach')).toEqual(['The beach'])
  })

  it('survives an empty or missing value', () => {
    expect(parsePeacePlaces('')).toEqual([])
    expect(parsePeacePlaces(null)).toEqual([])
    expect(parsePeacePlaces(undefined)).toEqual([])
  })

  it('tolerates a hand-typed list with loose spacing', () => {
    expect(parsePeacePlaces('The beach ,On a walk,  With my coffee'))
      .toEqual(['The beach', 'On a walk', 'With my coffee'])
  })
})

describe('telling a preset from something they typed', () => {
  it('recognises a menu option, case-insensitively', () => {
    expect(isPresetPlace('The beach')).toBe(true)
    expect(isPresetPlace('the BEACH')).toBe(true)
  })

  it('does not claim a custom answer', () => {
    expect(isPresetPlace('My nan’s kitchen')).toBe(false)
  })
})

// The card stores labels, not emoji, so the icon has to be looked back up to be
// drawn on it.
describe('icons for the card', () => {
  it('finds the icon for a menu label', () => {
    expect(emojiForPlace('The beach')).toBe('🏝️')
    expect(emojiForPlace('with my crystals')).toBe('💎')
  })

  it('returns null for something they typed themselves', () => {
    // Better no icon than a guessed one on somebody's own words.
    expect(emojiForPlace('My nan’s kitchen')).toBeNull()
    expect(emojiForPlace('')).toBeNull()
  })

  it('pairs a stored value into icon + label, keeping custom entries', () => {
    expect(placesWithIcons('The beach, My nan’s kitchen')).toEqual([
      { label: 'The beach', emoji: '🏝️' },
      { label: 'My nan’s kitchen', emoji: null },
    ])
  })

  it('is empty for a profile that never set one', () => {
    expect(placesWithIcons(null)).toEqual([])
  })

  it('gives every menu option a findable icon', () => {
    for (const p of PEACE_PLACES) expect(emojiForPlace(p.label)).toBe(p.emoji)
  })
})
