import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import AppNav from '@/components/AppNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  if (!user) redirect('/login')
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#34c5c5]/10 via-[#F6F8FA] to-white">
      <AppNav />
      {children}
    </div>
  )
}
