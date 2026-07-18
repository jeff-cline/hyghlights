'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GroupActions({ groupId, inviteCode }: { groupId: string; inviteCode: string }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  async function leave() {
    setLeaving(true)
    await fetch('/api/groups/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    })
    router.push('/groups')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={copy}
        className="text-xs font-bold text-[#0D9488] bg-[#34c5c5]/10 rounded-full px-3 py-1.5 tracking-widest hover:bg-[#34c5c5]/20"
      >
        {copied ? 'Copied ✓' : `Invite code: ${inviteCode}`}
      </button>
      <button
        type="button"
        onClick={leave}
        disabled={leaving}
        className="text-xs font-bold text-gray-400 hover:text-red-600 disabled:opacity-50"
      >
        Leave
      </button>
    </div>
  )
}
