import { UTApi, UTFile } from 'uploadthing/server'

// Uploads go to Jeff's shared uploadthing account (same store as Krystalore).
// v7 UTApi wants a base64 token; if the env holds the legacy sk_ key we wrap it
// into the token shape — identical to Krystalore's working upload route.
function makeApi(): UTApi {
  const raw = process.env.UPLOADTHING_TOKEN || process.env.UPLOADTHING_SECRET
  if (!raw) throw new Error('UploadThing not configured (set UPLOADTHING_TOKEN).')
  const appId = process.env.UPLOADTHING_APP_ID || '66x17tzw9x'
  const token = raw.startsWith('sk_')
    ? Buffer.from(JSON.stringify({ apiKey: raw, appId, regions: ['sea1'] })).toString('base64')
    : raw
  return new UTApi({ token })
}

export async function uploadFile(file: File): Promise<{ url: string; kind: 'image' | 'video' }> {
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_')
  const utFile = new UTFile([await file.arrayBuffer()], safeName, {
    type: file.type || 'application/octet-stream',
  })
  const result = await makeApi().uploadFiles(utFile)
  if (!result || result.error) throw new Error(result?.error?.message || 'Upload failed')
  const url = result.data?.ufsUrl || result.data?.url
  if (!url) throw new Error('Upload returned no URL')
  return { url, kind: (file.type || '').startsWith('video/') ? 'video' : 'image' }
}
