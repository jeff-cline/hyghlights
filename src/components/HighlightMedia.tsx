export default function HighlightMedia({
  photoUrl,
  videoUrl,
}: {
  photoUrl?: string | null
  videoUrl?: string | null
}) {
  if (!photoUrl && !videoUrl) return null
  return (
    <div className="mt-3 mb-3">
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" loading="lazy" className="max-h-72 rounded-2xl border border-gray-100" />
      )}
      {videoUrl && <video src={videoUrl} controls playsInline className="max-h-72 rounded-2xl border border-gray-100" />}
    </div>
  )
}
