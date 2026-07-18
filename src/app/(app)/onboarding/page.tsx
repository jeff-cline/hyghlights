import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getOrCreateProfile } from '@/lib/highlights'
import OnboardingFlow from '@/components/OnboardingFlow'

export default async function OnboardingPage() {
  const user = await requireUser()
  if (!user) redirect('/login')
  const profile = await getOrCreateProfile(user.userId, user.email)
  if (profile.onboardedAt) redirect('/home')

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <OnboardingFlow initialName={profile.displayName || user.email.split('@')[0]} />
    </main>
  )
}
