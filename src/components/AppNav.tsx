'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const LINKS = [
  { href: '/home', label: 'Today' },
  { href: '/community', label: 'Community' },
  { href: '/jar', label: 'The Jar' },
  { href: '/groups', label: 'Groups' },
  { href: '/settings', label: 'Settings' },
]

export default function AppNav() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="text-lg font-black tracking-tight">
          <span className="text-gray-800">HYgh</span><span className="text-[#e07800]">Lights</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const on = pathname === l.href || pathname.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-bold rounded-full px-3.5 py-1.5 transition-colors ${
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
            className="text-sm font-bold text-gray-400 hover:text-gray-700 px-3 py-1.5"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
