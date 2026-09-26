import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import AppNav from '@/components/AppNav'
import { unopenedCount } from '@/lib/bottles'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  if (!user) redirect('/login')

  // Unopened bottles are the only notification that exists today. Counted here
  // rather than inside the nav so the nav stays a presentational client
  // component, and counted on every app page so the badge cannot go stale.
  const unopened = await unopenedCount(user.email)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white">
      <AppNav unopened={unopened} />
      {children}
    </div>
  )
}
