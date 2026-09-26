import type { Metadata } from 'next'
import Link from 'next/link'
import Wordmark, { WORDMARK_TEXT } from '@/components/Wordmark'

export const metadata: Metadata = {
  title: `Terms & The Agreement — ${WORDMARK_TEXT}`,
  description:
    'A private, invite-only community for wins, healing and encouragement. What we ask of each other, and what we will not host.',
}

/** What the community is for. The positive half, stated first on purpose. */
const WE_ARE_HERE_FOR = [
  ['Love', 'The reason any of this works. Assume the best of the person posting.'],
  ['Peace', 'This is a calm place. Nobody should brace themselves before opening it.'],
  ['Patience', 'People heal at their own speed. Someone on day three is not behind.'],
  ['Kindness', 'Say the encouraging thing. If you cannot, say nothing — that is allowed.'],
  ['Brightness', 'Energy, frequency, flow. Leave the room lighter than you found it.'],
] as const

/** And the honest other half — because a value with no line under it is a slogan. */
const NOT_HERE = [
  'Negative news, doom-scrolling fuel, or outrage. There are enough places for that.',
  'Cruelty, contempt, mockery, or pile-ons — including the kind dressed up as honesty.',
  'Harassment, hate, or anything targeting who a person is.',
  'Medical claims presented as fact, or pressure on anyone about their body or health.',
  'Selling, spamming, recruiting, or harvesting anybody here as a lead.',
  "Reposting someone's private words or images anywhere outside this community.",
] as const

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-block text-2xl font-black tracking-tight">
          <Wordmark />
        </Link>

        <h1 className="mt-8 text-3xl font-black leading-tight text-gray-800 md:text-4xl">
          The Agreement
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          This is less a legal document than a promise we make to each other. Read it
          properly — it is short, and it is the whole reason this place feels the way
          it does.
        </p>

        {/* ── private and invite-only ─────────────────────────────────── */}
        <section className="mt-10 rounded-3xl border border-[#0D9488]/20 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-gray-800">
            This is a private, invite-only community
          </h2>
          <p className="mt-3 text-gray-600">
            <Wordmark /> is not a public social network. You are here because someone
            shared their card with you, or because you are already part of Beyond Limits
            Bootcamp. That is the only way in, and it is deliberate: a room where
            everybody arrived through somebody they trust behaves differently from a room
            anyone can walk into.
          </p>
          <p className="mt-3 text-gray-600">
            What people write here is personal — wins, setbacks, healing, the hard days.
            Treat all of it as said in confidence. A member&apos;s card is theirs to
            share; <strong className="text-gray-800">their posts are not yours to
            share.</strong>
          </p>
        </section>

        {/* ── the positive half ───────────────────────────────────────── */}
        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-gray-800">What we are here for</h2>
          <p className="mt-2 text-gray-600">
            We are here to be change makers — to be a positive influence, and to help
            each other on the journey of making the world better. This is an expression
            of our heart.
          </p>
          <dl className="mt-5 space-y-4">
            {WE_ARE_HERE_FOR.map(([word, meaning]) => (
              <div key={word} className="flex gap-4">
                <dt className="w-24 shrink-0 font-black text-[#0D9488]">{word}</dt>
                <dd className="text-gray-600">{meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── the line ────────────────────────────────────────────────── */}
        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-gray-800">What this is not for</h2>
          <p className="mt-2 text-gray-600">
            Said plainly, because a value with nothing underneath it is only a slogan.
            Please do not bring:
          </p>
          <ul className="mt-4 space-y-3">
            {NOT_HERE.map((item) => (
              <li key={item} className="flex gap-3 text-gray-600">
                <span aria-hidden="true" className="mt-0.5 font-black text-[#e07800]">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl bg-[#F6F8FA] p-4 text-sm text-gray-600">
            <strong className="text-gray-800">One honest exception.</strong> &ldquo;Only
            positivity&rdquo; does not mean pretending. A hard day, a relapse, a grief —
            those belong here, and sharing them is not negativity. The difference is
            direction: we are moving towards light together. Struggle shared in that
            spirit is welcome. Contempt, doom and cruelty are not.
          </p>
        </section>

        {/* ── how it is kept ──────────────────────────────────────────── */}
        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-gray-800">How this is kept</h2>
          <ul className="mt-4 space-y-3 text-gray-600">
            <li>
              <strong className="text-gray-800">We will remove things.</strong> Content
              that works against the spirit above can be taken down, and accounts that
              keep bringing it can lose access. There is no appeal process and no debate
              about it — protecting the room comes first.
            </li>
            <li>
              <strong className="text-gray-800">You own your words.</strong> What you
              post is yours. You can edit or delete anything you have written, at any
              time, and you can close your account and take your content with you.
            </li>
            <li>
              <strong className="text-gray-800">You choose what is public.</strong>
              {' '}Everything you post is members-only unless you decide otherwise.
              Your card is the one thing built to be shared outward, and only you can
              turn it on.
            </li>
            <li>
              <strong className="text-gray-800">We do not sell you.</strong> Your posts,
              reflections and check-ins are not for sale and are not training data for
              anyone else.
            </li>
            <li>
              <strong className="text-gray-800">One account, two products.</strong> Your
              login also works on Beyond Limits Bootcamp, and a password changed on
              either changes both. Same person, same account.
            </li>
          </ul>
        </section>

        {/* ── the plain-language legal bit ────────────────────────────── */}
        <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-black text-gray-800">The necessary small print</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-600">
            <p>
              <strong className="text-gray-800">This is not medical advice.</strong>{' '}
              Nothing here — from us, from a coach, or from another member — is a
              diagnosis or treatment. Talk to a qualified professional about your health.
              If you are in crisis, please contact your local emergency services.
            </p>
            <p>
              <strong className="text-gray-800">Be 18 or older</strong> to hold an
              account.
            </p>
            <p>
              <strong className="text-gray-800">Post only what is yours to post.</strong>{' '}
              Your own words, your own images, and other people only with their
              permission.
            </p>
            <p>
              <strong className="text-gray-800">These terms can change.</strong> If they
              change in a way that matters, we will say so rather than quietly updating
              the page.
            </p>
          </div>
        </section>

        <p className="mt-8 text-center text-sm text-gray-500">
          Questions, or something that needs removing? Tell us and we will act on it.
        </p>
        <p className="mt-8 text-center">
          <Link href="/signup"
                className="inline-block rounded-full bg-gradient-to-r from-[#E8A849] to-[#e07800] px-8 py-3.5 font-black text-white shadow-lg transition-transform hover:scale-[1.02]">
            I&apos;m in — create my free account
          </Link>
        </p>
      </div>
    </main>
  )
}
