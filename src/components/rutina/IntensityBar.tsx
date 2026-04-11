export default function IntensityBar({ intensity }: { intensity: 'high' | 'medium' | 'low' }) {
  // Mapping of exact intensity to tailwind background colors as defined in specifications
  const colors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-400',
    low: 'bg-green-500',
  }

  const bgColor = colors[intensity] || 'bg-surface'

  return (
    <div className="w-1 h-16 rounded-full mx-1 flex-shrink-0 relative overflow-hidden bg-carbon/70 shadow-inner">
      <div className={`absolute bottom-0 w-full rounded-full ${bgColor} h-full pointer-events-none transition-colors duration-500`} />
    </div>
  )
}
