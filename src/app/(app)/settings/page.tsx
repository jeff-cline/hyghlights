import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/session'
import { getOrCreateProfile } from '@/lib/highlights'
import SettingsForm from '@/components/SettingsForm'
import DeviceList from '@/components/DeviceList'
import { listDevices } from '@/lib/devices'
import { getSession } from '@/lib/session'

export default async function SettingsPage() {
  const user = await requireUser()
  if (!user) redirect('/login')
  const profile = await getOrCreateProfile(user.userId, user.email)
  const session = await getSession()
  const devices = await listDevices(user.userId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">Settings</h1>
      <p className="text-gray-500 mb-8">Make this space yours.</p>
      <SettingsForm
        initial={{
          displayName: profile.displayName ?? '',
          peacePlace: profile.peacePlace ?? '',
          celebrationSong: profile.celebrationSong ?? '',
          why: profile.why ?? '',
          cardPublic: profile.cardPublic,
          cardSlug: profile.cardSlug,
        }}
      />

      <div className="mt-6">
        <DeviceList
          initial={devices.map((d) => ({
            id: d.id,
            label: d.label,
            lastIp: d.lastIp,
            createdAt: d.createdAt.toISOString(),
            lastSeenAt: d.lastSeenAt.toISOString(),
            isCurrent: d.id === session?.deviceId,
          }))}
        />
      </div>
    </main>
  )
}
