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
const PALE = '#9FE8E8'
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

  const places = placesWithIcons(card.peacePlace).filter((p) => p.emoji)
  const firstName = card.displayName.split(' ')[0]

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: `linear-gradient(135deg, ${NAVY} 0%, ${MID} 55%, ${NAVY} 100%)`,
        padding: '56px 64px', color: '#fff',
        fontFamily: 'sans-serif',
      }}>
        {/* the mark */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 34, fontWeight: 900 }}>
          <span style={{ color: '#fff' }}>h</span>
          <span style={{ color: ORANGE }}>Y</span>
          <span style={{ color: '#fff' }}>ghlights</span>
        </div>

        {/* who */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34 }}>
          <div style={{
            display: 'flex', fontSize: 20, letterSpacing: 4, color: PALE,
            textTransform: 'uppercase', fontWeight: 700,
          }}>
            {card.totalWins} {card.totalWins === 1 ? 'win' : 'wins'} celebrated
          </div>
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 900, marginTop: 8, lineHeight: 1.05 }}>
            {card.displayName}
          </div>
        </div>

        {/* their why — the reason the Y is capitalised */}
        {card.why && (
          <div style={{
            display: 'flex', flexDirection: 'column', marginTop: 26,
            borderLeft: `6px solid ${GOLD}`, paddingLeft: 22,
          }}>
            <div style={{ display: 'flex', fontSize: 17, letterSpacing: 3, color: GOLD, fontWeight: 800 }}>
              MY WHY
            </div>
            <div style={{
              display: 'flex', fontSize: 34, color: 'rgba(255,255,255,0.92)',
              marginTop: 6, lineHeight: 1.25,
            }}>
              {`“${card.why.slice(0, 120)}”`}
            </div>
          </div>
        )}

        {/* the icons, which is the point of putting this in the image */}
        {places.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 30 }}>
            {places.map((p) => (
              <div key={p.label} style={{
                display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 999, padding: '10px 20px', marginRight: 12, marginBottom: 12,
              }}>
                <span style={{ fontSize: 34 }}>{p.emoji}</span>
                <span style={{ fontSize: 22, marginLeft: 12, color: 'rgba(255,255,255,0.85)' }}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* pushed to the bottom whatever is above it */}
        <div style={{ display: 'flex', flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            <Stat value={String(card.currentStreak)} label="DAY STREAK" gold />
            <Stat value={String(card.totalWins)} label="WINS" />
            <Stat value={String(card.longestStreak)} label="BEST" />
          </div>
          <div style={{
            display: 'flex', fontSize: 22, color: TEAL, fontWeight: 800,
          }}>
            {`See ${firstName}’s wins · hyghlights.com`}
          </div>
        </div>
      </div>
    ),
    size,
  )
}

function Stat({ value, label, gold }: { value: string; label: string; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginRight: 46 }}>
      <div style={{
        display: 'flex', fontSize: 52, fontWeight: 900,
        color: gold ? GOLD : '#fff',
      }}>
        {value}
      </div>
      <div style={{
        display: 'flex', fontSize: 15, letterSpacing: 2.5,
        color: 'rgba(255,255,255,0.55)', fontWeight: 700, marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  )
}
