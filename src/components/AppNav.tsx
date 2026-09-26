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

export default function AppNav() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/home" className="shrink-0 text-lg font-black tracking-tight">
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
