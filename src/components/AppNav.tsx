'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const LINKS = [
  { href: '/home', label: 'Today' },
  { href: '/jar', label: 'The Jar' },
  { href: '/groups', label: 'Groups' },
  { href: '/settings', label: 'Settings' },
]

export default function AppNav() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 bg-[#0b0b0d]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="text-lg font-black tracking-tight">
          <span className="text-white">HYgh</span><span className="text-[#C9A24B]">Lights</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const on = pathname === l.href || pathname.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-bold rounded-full px-3.5 py-1.5 transition-colors ${
                  on ? 'bg-[#C9A24B] text-black' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm font-bold text-white/40 hover:text-white px-3 py-1.5"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
