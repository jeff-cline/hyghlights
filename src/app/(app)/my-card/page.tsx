import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getOrCreateProfile } from '@/lib/highlights'
import { cardPath } from '@/lib/card'

export const dynamic = 'force-dynamic'

/**
 * "My Card" in the nav, which cannot be a plain link.
 *
 * The real card lives at /my-card/<slug>, and the slug only exists once the
 * member has switched their card on. A nav item that 404s for everyone who has
 * not is worse than no nav item, so this stands in front of it: on to your card
 * if it is live, or to the switch that makes it live.
 *
 * Deliberately not a client-side check — the nav is a client component and does
 * not know your slug, and passing it down would mean re-rendering the whole
 * header the moment anybody toggles anything.
 */
export default async function MyCardRedirect() {
  const user = await requireUser()
  if (!user) redirect('/login')

  const profile = await getOrCreateProfile(user.userId, user.email)
  if (profile.cardPublic && profile.cardSlug) redirect(cardPath(profile.cardSlug))

  // Not on yet. The settings page is where the switch and the preview are.
  redirect('/settings#card')
}
