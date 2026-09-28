'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Wordmark from '@/components/Wordmark'

const LINKS = [
  { href: '/home', label: 'Today' },
  { href: '/thrive', label: 'Thrive 🚀' },
  { href: '/community', label: 'Community' },
  { href: '/jar', label: 'The Jar' },
  { href: '/recap', label: 'Recap' },
  { href: '/groups', label: 'Groups' },
  // Its own item rather than buried in settings: a card nobody can find is a
  // card nobody shares, and sharing is the whole reason it exists.
  { href: '/my-card', label: 'My Card ✨' },
  { href: '/bottles', label: 'Ocean 🌊' },
  { href: '/settings', label: 'Settings' },
]

export default function AppNav({ unopened = 0 }: { unopened?: number }) {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/community" className="shrink-0 text-lg font-black tracking-tight">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => {
            const on = pathname === l.href || pathname.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 text-sm font-bold rounded-full px-3.5 py-1.5 transition-colors ${
                  on
                    ? 'bg-gradient-to-r from-[#E8A849] to-[#e07800] text-white shadow'
                    : 'text-gray-500 hover:text-[#0D9488] hover:bg-[#34c5c5]/10'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
          {/* The count, where it is looked for: top right, before sign out. Zero
              renders nothing — a badge showing 0 is noise pretending to be news. */}
          {unopened > 0 && (
            <Link
              href="/bottles"
              aria-label={`${unopened} unopened ${unopened === 1 ? 'bottle' : 'bottles'}`}
              className="relative shrink-0 rounded-full px-2 py-1.5 text-gray-500 transition-colors hover:text-[#0D9488]"
            >
              <span aria-hidden="true" className="text-lg">🔔</span>
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#e07800] px-1 text-[11px] font-black text-white">
                {unopened > 9 ? '9+' : unopened}
              </span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="shrink-0 text-sm font-bold text-gray-400 hover:text-gray-700 px-3 py-1.5"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
