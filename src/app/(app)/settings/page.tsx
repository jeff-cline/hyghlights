import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getOrCreateProfile } from '@/lib/highlights'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const user = await requireUser()
  if (!user) redirect('/login')
  const profile = await getOrCreateProfile(user.userId, user.email)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">Settings</h1>
      <p className="text-gray-500 mb-8">Make this space yours.</p>
      <SettingsForm
        initial={{
          displayName: profile.displayName ?? '',
          peacePlace: profile.peacePlace ?? '',
          celebrationSong: profile.celebrationSong ?? '',
        }}
      />
    </main>
  )
}
