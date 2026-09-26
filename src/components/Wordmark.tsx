/**
 * hYghlights.
 *
 * One component so the mark cannot drift. It was previously written out by hand
 * in seven files as `<span>HYgh</span><span>Lights</span>`, which is exactly how
 * a logo ends up subtly different on the login page than on the nav.
 *
 * The capital Y is the whole idea: the Y is *why*. Why you are doing this, why
 * it matters. So it is the one letter that is bold and the one letter with its
 * own colour — orange, against the teal glow on the rest.
 *
 * Styles live in globals.css (`.hy-wordmark`, `.hy-y`) because the mark is a
 * layered text-shadow, which is unreadable as inline Tailwind and must be
 * identical everywhere.
 */
export default function Wordmark({
  className = '',
  onDark = false,
  as: Tag = 'span',
}: {
  className?: string
  /** Inverts the word to white for dark panels, keeping both glows. */
  onDark?: boolean
  as?: 'span' | 'h1' | 'h2' | 'div'
}) {
  return (
    <Tag className={`hy-wordmark ${onDark ? 'hy-wordmark-on-dark' : ''} ${className}`.trim()}>
      {/* Split only so the Y can carry its own glow. Screen readers still read
          one word, because there is no whitespace or aria between the spans. */}
      h<span className="hy-y">Y</span>ghlights
    </Tag>
  )
}

/**
 * The name as plain text, for page titles, emails and anywhere a React node
 * will not go.
 *
 * Exported as a constant rather than typed out repeatedly so the capitalisation
 * has exactly one source of truth — it is the kind of detail that silently
 * reverts to "Hyghlights" the third time somebody writes it from memory.
 */
export const WORDMARK_TEXT = 'hYghlights'
