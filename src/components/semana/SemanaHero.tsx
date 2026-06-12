import Image from 'next/image'

export default function SemanaHero({ week, lang }: { week: number, lang: string }) {
  const weekLabel = lang === 'es' ? `Semana ${week}` : `Week ${week}`

  return (
    <div className="relative w-full h-[45vh] min-h-[350px] flex flex-col justify-end p-8">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/fotos/pantalla-semanas.jpg"
          alt={weekLabel}
          fill
          priority
          className="object-cover object-[center_top]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full text-center">
        <h1 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter drop-shadow-2xl">
          {weekLabel}
        </h1>
      </div>
    </div>
  )
}
