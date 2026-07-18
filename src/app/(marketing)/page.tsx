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
    <main className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white text-gray-800">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-black tracking-tight">
          <span className="text-gray-800">HYgh</span><span className="text-[#e07800]">Lights</span>
        </div>
        <Link href="/login" className="text-sm font-bold text-white bg-gradient-to-r from-[#E8A849] to-[#e07800] rounded-full px-5 py-2 hover:scale-105 transition-transform">
          Sign in
        </Link>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#34c5c5]/15 text-[#0D9488] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-8">
          The iTHRIVE ritual
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] mb-6 text-gray-900">
          Every day deserves to be{' '}
          <span className="text-[#e07800]">seen, tracked, and celebrated.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          HYghLights is your daily practice for capturing wins, honoring progress, and living a life
          you don&apos;t need to vacation from. What were your highlights today?
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/login" className="bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white font-black px-8 py-3.5 rounded-full hover:scale-105 transition-transform shadow-lg">
            Start today
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <p className="text-center text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">
          Start unstoppable. Track everything. Then go execute.
        </p>
        <div className="grid gap-3">
          {ITHRIVE.map(([letter, phrase], i) => (
            <div key={i} className="flex items-center gap-5 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
              <span className="text-3xl font-black text-[#e07800] w-8 text-center">{letter}</span>
              <span className="text-lg font-bold text-gray-800">{phrase}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
