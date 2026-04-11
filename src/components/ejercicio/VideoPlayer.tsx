import { BUNNY_CDN_BASE } from '@/lib/constants'

export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const fullUrl = `${BUNNY_CDN_BASE}${videoUrl}`

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-carbon shadow-2xl ring-1 ring-white/10">
      <video
        src={fullUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      {/* Overlay light shimmer */}
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/40 to-transparent pointer-events-none" />
    </div>
  )
}
