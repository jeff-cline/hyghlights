// Where somebody goes to reflect.
//
// Pure and DB-free so onboarding, settings and the API all agree on what a
// valid answer looks like. The value is stored as one comma-joined string in
// `Profile.peacePlace` — a column that already exists and already holds single
// answers for the people who onboarded before this was a list. Joining rather
// than adding a table keeps every one of those rows valid and readable, and
// `parsePeacePlaces` turns a single old answer back into a list of one.

export type PeacePlace = { emoji: string; label: string }

/**
 * The menu. Deliberately long — a peace place is personal, and six options
 * mostly tell people none of them is theirs.
 *
 * Weighted towards the ordinary and the free. A wellness product that offers
 * only beaches and mountains quietly says reflection is for people with time
 * and money; the car, the shower and the bus are where most people actually
 * get a minute to themselves.
 */
export const PEACE_PLACES: PeacePlace[] = [
  { emoji: '🏝️', label: 'The beach' },
  { emoji: '🌊', label: 'By the ocean' },
  { emoji: '☀️', label: 'At sunrise' },
  { emoji: '🌙', label: 'Under the stars' },
  { emoji: '🔥', label: 'A bonfire' },
  { emoji: '🌹', label: 'In the garden' },
  { emoji: '🧘', label: 'A quiet corner' },
  { emoji: '🌲', label: 'In the forest' },
  { emoji: '⛰️', label: 'On a mountain' },
  { emoji: '🚶', label: 'On a walk' },
  { emoji: '☕', label: 'With my coffee' },
  { emoji: '🛁', label: 'A long bath' },
  { emoji: '🚿', label: 'In the shower' },
  { emoji: '📖', label: 'With a book' },
  { emoji: '🎧', label: 'Music on, eyes closed' },
  { emoji: '🐾', label: 'With my dog' },
  { emoji: '🪟', label: 'By a window' },
  { emoji: '🚗', label: 'Parked in the car' },
  { emoji: '✍️', label: 'Journalling at the table' },
  { emoji: '🛏️', label: 'Just before sleep' },
  { emoji: '⛪', label: 'Somewhere sacred' },
  { emoji: '💎', label: 'With my crystals' },
  { emoji: '💪', label: 'Mid-workout' },
  { emoji: '💯', label: 'Right after a win' },
  { emoji: '🚀', label: 'Dreaming something up' },
]

/** How many they may hold at once. */
export const MAX_PEACE_PLACES = 5

/** Matches the zod cap on `peacePlace` in src/app/api/profile/route.ts. */
export const PEACE_PLACE_MAX_CHARS = 280

const SEPARATOR = ', '

/**
 * Clean a selection into the single string that gets stored.
 *
 * De-duplicated without regard to case, because someone can pick "A long bath"
 * from the menu and also type "a long bath" in the free-text box, and being
 * told their peace place is "A long bath, a long bath" is a small insult.
 *
 * Capped at both the count and the character limit. The character cap is not
 * theoretical: the free-text entry is a text box, and one long answer could
 * otherwise push the joined string past what the API will accept — which would
 * fail at save, after they had finished, with nothing useful to tell them.
 */
export function formatPeacePlaces(labels: readonly string[]): string {
  const seen = new Set<string>()
  const out: string[] = []

  for (const raw of labels) {
    const label = String(raw ?? '').trim().replace(/\s+/g, ' ')
    if (!label) continue
    const key = label.toLocaleLowerCase()
    if (seen.has(key)) continue

    // Would adding this one overflow the column? Then stop, keeping what fits,
    // rather than saving a truncated final entry that reads like a typo.
    const candidate = [...out, label].join(SEPARATOR)
    if (candidate.length > PEACE_PLACE_MAX_CHARS) break

    seen.add(key)
    out.push(label)
    if (out.length >= MAX_PEACE_PLACES) break
  }

  return out.join(SEPARATOR)
}

/**
 * Read a stored value back into a list.
 *
 * A profile saved before this was multi-select holds one plain answer, which
 * comes back as a list of one and selects correctly in the UI. Nothing needed
 * migrating.
 */
export function parsePeacePlaces(value: string | null | undefined): string[] {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .slice(0, MAX_PEACE_PLACES)
}

/** True when this label came from the menu rather than the free-text box. */
export function isPresetPlace(label: string): boolean {
  const key = label.trim().toLocaleLowerCase()
  return PEACE_PLACES.some((p) => p.label.toLocaleLowerCase() === key)
}
