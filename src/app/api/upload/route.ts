import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { uploadFile } from '@/lib/uploadthing'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_IMAGE = 16 * 1024 * 1024 // 16 MB
const MAX_VIDEO = 256 * 1024 * 1024 // 256 MB

export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'A file is required.' }, { status: 400 })
  }
  const isImage = (file.type || '').startsWith('image/')
  const isVideo = (file.type || '').startsWith('video/')
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'Only photos and videos can be attached.' }, { status: 400 })
  }
  if (file.size > (isVideo ? MAX_VIDEO : MAX_IMAGE)) {
    return NextResponse.json(
      { error: `That ${isVideo ? 'video' : 'photo'} is too large (max ${isVideo ? '256MB' : '16MB'}).` },
      { status: 400 },
    )
  }

  try {
    const { url, kind } = await uploadFile(file)
    return NextResponse.json({ url, kind })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'Upload failed.' }, { status: 502 })
  }
}
