import { ImageResponse } from 'next/og'
import { getPublicCard } from '@/lib/card-data'
import { placesWithIcons } from '@/lib/peace-places'

// The share image. This is what a pasted card actually looks like in a feed, on
// WhatsApp, in an iMessage bubble — which for most people is the only part of
// the card they will ever see. It carries the icons, because a row of glyphs is
// what makes it read as a person rather than a link.
//
// Satori renders this, not a browser: flexbox only, no CSS grid, and any div
// with more than one child needs display:flex stated explicitly. The glow on the
// wordmark is dropped here — text-shadow is not reliably supported — so the mark
// falls back to colour alone, black word and orange Y, exactly as it does in
// email.

export const runtime = 'nodejs'
export const alt = 'A hYghlights card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Cached for an hour: a card changes rarely and every social crawler asks. */
export const revalidate = 3600

const NAVY = '#0B1D2A'
const MID = '#123243'
const TEAL = '#34c5c5'
const GOLD = '#E8A849'
const ORANGE = '#e07800'

export default async function Image(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const card = await getPublicCard(slug)

  // A card that is off or missing gets a plain invitation rather than a broken
  // image — and, importantly, nothing about whether that member exists.
  if (!card) {
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: NAVY, color: '#fff',
          fontSize: 64, fontWeight: 900,
        }}>
          <span style={{ color: '#fff' }}>h</span>
          <span style={{ color: ORANGE }}>Y</span>
          <span style={{ color: '#fff' }}>ghlights</span>
        </div>
      ),
      size,
    )
  }

  // How many chips fit depends on what else is on the card. Satori has a fixed
  // 630px and no overflow: too much content does not scroll or clip tidily, it
  // compresses until the blocks overlap each other. Measured, not guessed — a
  // long name plus a why plus two rows of chips came to roughly 568px against
  // 550 available, and the why printed straight through the name.
  const hasWhy = Boolean(card.why)
  const places = placesWithIcons(card.peacePlace)
    .filter((p) => p.emoji)
    .slice(0, hasWhy ? 3 : 4)

  // A long name at 76px runs off the side. Stepped down rather than wrapped,
  // because a two-line name pushes everything below it off the image.
  const nameSize = card.displayName.length > 22 ? 54
    : card.displayName.length > 16 ? 64
    : 76

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${NAVY} 0%, ${MID} 55%, ${NAVY} 100%)`,
        padding: '40px 64px', color: '#fff', fontFamily: 'sans-serif',
      }}>
        {/* the mark, big — this is the brand doing the work in a feed */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 68, fontWeight: 900, flexShrink: 0 }}>
          <span style={{ color: '#fff' }}>h</span>
          <span style={{ color: ORANGE }}>Y</span>
          <span style={{ color: '#fff' }}>ghlights</span>
        </div>

        {/* the name, centred beneath it */}
        <div style={{
          display: 'flex', flexShrink: 0, fontSize: nameSize, fontWeight: 900, marginTop: 10,
          lineHeight: 1.05, textAlign: 'center', color: '#fff',
        }}>
          {card.displayName}
        </div>

        {/* their why, when they have written one */}
        {card.why && (
          <div style={{
            display: 'flex', flexShrink: 0, fontSize: 28, color: 'rgba(255,255,255,0.78)',
            marginTop: 12, textAlign: 'center', maxWidth: 880,
          }}>
            {`“${card.why.slice(0, 100)}”`}
          </div>
        )}

        {/* the icons, larger, directly under the name */}
        {places.length > 0 && (
          <div style={{
            display: 'flex', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'center',
            marginTop: 22, maxWidth: 1040,
          }}>
            {places.map((p) => (
              <div key={p.label} style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: 999, padding: '14px 28px', margin: 8,
              }}>
                <span style={{ fontSize: 60 }}>{p.emoji}</span>
                <span style={{ fontSize: 30, marginLeft: 16, color: 'rgba(255,255,255,0.9)' }}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* the invitation, which is what a stranger is actually being offered */}
        <div style={{
          display: 'flex', flexShrink: 0, fontSize: 52, fontWeight: 900, color: GOLD, marginTop: 22,
        }}>
          Follow my journey…
        </div>

        <div style={{
          display: 'flex', flexShrink: 0, fontSize: 24, color: TEAL, fontWeight: 700, marginTop: 8,
        }}>
          {`hyghlights.com · ${card.currentStreak} day streak · ${card.totalWins} ${card.totalWins === 1 ? 'win' : 'wins'}`}
        </div>
      </div>
    ),
    size,
  )
}
