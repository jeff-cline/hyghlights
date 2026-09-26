// The public card: /my-card/firstname-lastname
//
// The one thing on this site that points outward. Everything else is
// members-only, which is why every decision here defaults to showing less:
// a card is off until its owner turns it on, and it carries only the wins they
// have each ticked.
//
// Pure and DB-free so the slug rule, the URL and the share links are computed
// the same way by the settings screen, the card page and the OG tags. A share
// button that builds a slightly different URL than the page it points at is a
// bug nobody notices until the link is already out in the world.

export const CARD_PATH = '/my-card'

/** Reserved words that must never become somebody's slug. */
const RESERVED = new Set([
  'new', 'edit', 'settings', 'admin', 'api', 'login', 'signup', 'terms',
  'privacy', 'about', 'help', 'me', 'my-card', 'card', 'home', 'null',
  'undefined', 'index',
])

export const SLUG_MAX = 60

/**
 * firstname-lastname from a display name.
 *
 * Unicode letters are kept rather than stripped, so a name with an accent or a
 * non-Latin script still produces their name and not a row of hyphens. The
 * result is lowercased for the URL, which makes a shared link work regardless of
 * how somebody retypes it.
 */
export function slugifyName(name: string | null | undefined): string {
  const base = String(name ?? '')
    .normalize('NFKD')
    // Drop the combining marks NFKD just split off. Without this, é becomes
    // "e" + an accent, the accent is not a letter, and Renée turns into
    // "rene-e-dubois" — the accent silently becomes a word break.
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase()
    .replace(/['’]/g, '')          // O'Brien -> obrien, not o-brien
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, '')

  return base
}

/**
 * The slug to try, and the fallbacks if it is taken.
 *
 * Numbered rather than randomised: `jeff-cline-2` is still recognisably a
 * person, and a card is something people read the URL of. The caller walks this
 * list against the database and stores the first free one — stored, because a
 * slug that changed when somebody edited their display name would break every
 * link they had already shared.
 */
export function slugCandidates(name: string | null | undefined, howMany = 25): string[] {
  const base = slugifyName(name)
  if (!base) return []

  const out: string[] = []
  if (!RESERVED.has(base)) out.push(base)

  for (let n = 2; out.length < howMany; n++) {
    const candidate = `${base}-${n}`
    if (!RESERVED.has(candidate)) out.push(candidate)
    if (n > howMany + 5) break
  }
  return out
}

/** True when a stored slug is still something we are willing to serve. */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > SLUG_MAX) return false
  if (RESERVED.has(slug)) return false
  return /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug)
}

export function cardPath(slug: string): string {
  return `${CARD_PATH}/${slug}`
}

/** Absolute, because share links and OG tags cannot use a relative path. */
export function cardUrl(slug: string, origin = 'https://hyghlights.com'): string {
  return `${origin.replace(/\/+$/, '')}${cardPath(slug)}`
}

export type ShareTarget = {
  key: string
  label: string
  /** null means "handled in the browser" — copying, or the native share sheet. */
  href: (url: string, text: string) => string | null
}

/**
 * Where a card can be shared.
 *
 * Plain web-intent URLs, deliberately. Every one of these networks offers an
 * SDK that would also let them watch our members; a link that opens a compose
 * window does the job and reports nothing back.
 */
export const SHARE_TARGETS: ShareTarget[] = [
  {
    key: 'x', label: 'X',
    href: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    key: 'facebook', label: 'Facebook',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'linkedin', label: 'LinkedIn',
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: 'whatsapp', label: 'WhatsApp',
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    key: 'email', label: 'Email',
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent('My hYghlights')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
  { key: 'copy', label: 'Copy link', href: () => null },
]

/** The words that travel with a shared card. */
export function shareText(displayName: string | null | undefined, why?: string | null): string {
  const who = String(displayName ?? '').trim()
  const because = String(why ?? '').trim()
  const lead = who ? `${who}’s wins on hYghlights` : 'My wins on hYghlights'
  return because ? `${lead} — “${because}”` : lead
}
