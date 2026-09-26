import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Wordmark from '@/components/Wordmark'
import { getPublicCard } from '@/lib/card-data'
import { cardUrl, shareText } from '@/lib/card'
import { CATEGORY_BY_KEY, categoryLabel } from '@/lib/categories'
import { placesWithIcons } from '@/lib/peace-places'
import ShareRow from '@/components/ShareRow'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

const MONTH_YEAR = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

/**
 * OG tags, so a pasted card unfurls into something worth clicking.
 *
 * `robots` is left at the default — a card its owner switched on is meant to be
 * found. A card that is off never reaches this function, because generateMetadata
 * and the page both go through getPublicCard, which cannot see it.
 */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const card = await getPublicCard(slug)
  if (!card) return { title: 'Not found', robots: { index: false, follow: false } }

  const title = `${card.displayName} · hYghlights`
  const wins = `${card.totalWins} ${card.totalWins === 1 ? 'win' : 'wins'}`
  const description = card.why
    ? `“${card.why}” — ${wins} celebrated on hYghlights.`
    : `${wins} celebrated on hYghlights. Come and capture yours.`

  return {
    title,
    description,
    alternates: { canonical: cardUrl(card.slug) },
    openGraph: {
      title, description, type: 'profile',
      url: cardUrl(card.slug),
      siteName: 'hYghlights',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function MyCardPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const card = await getPublicCard(slug)
  // Off and non-existent are the same 404 on purpose: on an invite-only site,
  // confirming that an address belongs to a member is itself a disclosure.
  if (!card) notFound()

  const url = cardUrl(card.slug)
  const places = placesWithIcons(card.peacePlace)

  // Who is looking. A shared card lands strangers and members alike on the same
  // page, and sending an existing member to a signup form is a dead end — they
  // already have an account, and the button they need says "take me in".
  const session = await getSession()
  const signedIn = Boolean(session?.userId)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight">
            <Wordmark />
          </Link>
        </div>

        {/* ── the card ─────────────────────────────────────────────────── */}
        <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
          <div className="bg-gradient-to-br from-[#0B1D2A] via-[#123243] to-[#0B1D2A] px-7 py-8 text-center text-white">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#9FE8E8]">
              Celebrating wins since {MONTH_YEAR.format(card.memberSince)}
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
              {card.displayName}
            </h1>

            {card.why && (
              <figure className="mx-auto mt-5 max-w-md">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E8A849]">
                  My why
                </p>
                <blockquote className="mt-1.5 text-lg leading-snug text-white/90">
                  “{card.why}”
                </blockquote>
              </figure>
            )}

            <div className="mt-7 grid grid-cols-3 gap-3">
              <Stat value={String(card.currentStreak)} label="Day streak" gold />
              <Stat value={String(card.totalWins)} label="Wins" />
              <Stat value={String(card.longestStreak)} label="Best streak" />
            </div>
          </div>

          {/* the wins they cleared, and only those */}
          <div className="px-7 py-7">
            {card.wins.length > 0 ? (
              <>
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
                  Wins {card.displayName.split(' ')[0]} chose to share
                </h2>
                <ul className="mt-4 space-y-3">
                  {card.wins.map((w) => {
                    const c = CATEGORY_BY_KEY[w.category]
                    return (
                      <li key={w.id} className="rounded-2xl bg-[#F6F8FA] px-5 py-4">
                        <p className="text-xs font-bold" style={{ color: c?.color ?? '#e07800' }}>
                          {c?.emoji} {categoryLabel(w.category)}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-gray-700">{w.text}</p>
                      </li>
                    )
                  })}
                </ul>
              </>
            ) : (
              <p className="text-center text-gray-500">
                {card.displayName.split(' ')[0]} is quietly collecting wins.
              </p>
            )}

            {places.length > 0 && (
              <div className="mt-7 border-t border-gray-100 pt-6">
                <p className="text-center text-xs font-black uppercase tracking-widest text-gray-400">
                  Where {card.displayName.split(' ')[0]} reflects
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {places.map((p) => (
                    <span key={p.label}
                          className="inline-flex items-center gap-2 rounded-full bg-[#F6F8FA] px-4 py-2 text-sm font-bold text-gray-700 ring-1 ring-gray-200">
                      {/* No icon for a place they typed themselves — inventing one
                          would be guessing at something personal. */}
                      {p.emoji && <span className="text-xl" aria-hidden="true">{p.emoji}</span>}
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── share it onward ──────────────────────────────────────────── */}
        <ShareRow url={url} text={shareText(card.displayName, card.why)}
                  slug={card.slug} canEmail={signedIn} />

        {/* ── the invitation, which is why this page is public ─────────── */}
        {/* In the member's own voice, because a stranger arrived here through a
            person, not through us. The ask comes before the branding. */}
        <section className="mt-8 rounded-3xl bg-gradient-to-br from-[#0B1D2A] via-[#123243] to-[#0B1D2A] p-7 text-center shadow-lg">
          <p className="mx-auto max-w-lg text-xl font-black leading-snug text-white md:text-2xl">
            I&rsquo;m celebrating wins with <Wordmark onDark />.
            Please follow my journey.
          </p>
          <p className="mx-auto mt-3 max-w-md text-white/85">
            {signedIn
              ? 'You are already a member — head back in and capture today\u2019s.'
              : 'Create an account if you don\u2019t have one, or sign in to yours.'}
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-[#0D9488]/20 bg-white p-7 text-center shadow-sm">
          {signedIn ? (
            <>
              <h2 className="text-2xl font-black leading-tight text-gray-800">
                Welcome back to <Wordmark />
              </h2>
              <p className="mx-auto mt-3 max-w-md text-gray-600">
                You are signed in. Go and capture today&rsquo;s win.
              </p>
              <Link href="/home"
                    className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3.5 font-black text-white shadow-lg transition-transform hover:scale-[1.02]">
                Go to my account
              </Link>
              <p className="mt-4 text-xs text-gray-500">
                <Link href="/my-card" className="font-bold text-[#0D9488] hover:underline">
                  Share your own card
                </Link>
                {' '}— it is how people find their way in.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black leading-tight text-gray-800">
                Follow the journey on <Wordmark />
              </h2>
              <p className="mx-auto mt-3 max-w-md text-gray-600">
                A private, invite-only community for people on a journey to make the world
                better. Love, peace, patience, kindness, brightness — and absolutely no
                doom. There are enough places for that.
              </p>
              <Link href="/signup"
                    className="mt-6 inline-block rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3.5 font-black text-white shadow-lg transition-transform hover:scale-[1.02]">
                Create my free account
              </Link>
              <p className="mt-4 text-xs text-gray-500">
                Free to join.{' '}
                <Link href="/terms" className="font-bold text-[#0D9488] hover:underline">
                  Read The Agreement
                </Link>
                {' '}first — it is short, and it is the point.{' '}
                <Link href="/login" className="font-bold text-[#0D9488] hover:underline">
                  Already a member?
                </Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function Stat({ value, label, gold }: { value: string; label: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-3 ring-1 ring-white/10">
      <div className={`text-2xl font-black ${gold ? 'text-[#E8A849]' : 'text-white'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-white/55">
        {label}
      </div>
    </div>
  )
}
