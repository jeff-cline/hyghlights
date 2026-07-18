import Link from 'next/link'

const ITHRIVE = [
  ['I', 'I Am Unstoppable'],
  ['T', 'Track Every Victory'],
  ['H', 'Honor Your Progress'],
  ['R', 'Recognize Your Wins'],
  ['I', 'Ignite Your Purpose'],
  ['V', 'Visualize Victory'],
  ['E', 'Execute with Excellence'],
]

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#15151a] via-[#0b0b0d] to-black text-white">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-black tracking-tight">
          <span>HYgh</span><span className="text-[#C9A24B]">Lights</span>
        </div>
        <Link href="/login" className="text-sm font-bold text-black bg-[#C9A24B] rounded-full px-5 py-2 hover:scale-105 transition-transform">
          Sign in
        </Link>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#34c5c5]/10 text-[#34c5c5] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-8">
          The iTHRIVE ritual
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-6">
          Every day deserves to be{' '}
          <span className="text-[#C9A24B]">seen, tracked, and celebrated.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
          HYghLights is your daily practice for capturing wins, honoring progress, and living a life
          you don&apos;t need to vacation from. What were your highlights today?
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="bg-gradient-to-r from-[#C9A24B] to-[#b8860b] text-black font-black px-8 py-3.5 rounded-full hover:scale-105 transition-transform">
            Start today
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <p className="text-center text-white/40 text-sm font-bold uppercase tracking-widest mb-8">
          Start unstoppable. Track everything. Then go execute.
        </p>
        <div className="grid gap-3">
          {ITHRIVE.map(([letter, phrase], i) => (
            <div key={i} className="flex items-center gap-5 bg-[#15151a] border border-white/10 rounded-2xl px-6 py-4">
              <span className="text-3xl font-black text-[#C9A24B] w-8 text-center">{letter}</span>
              <span className="text-lg font-bold">{phrase}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
