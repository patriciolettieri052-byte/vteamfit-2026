import Image from 'next/image'
import { Plan } from '@/types'

export default function PlanHero({ plan, lang }: { plan: Plan; lang: 'es' | 'en' }) {
  const name = lang === 'es' ? plan.name_es : plan.name_en
  
  return (
    <section className="relative w-full h-[60vh] min-h-[450px] flex flex-col justify-end pb-12 px-6">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={plan.cover_image}
          alt={name}
          fill
          priority
          className={`object-cover ${plan.slug === 'transforma-tu-cuerpo' ? 'object-[center_40%]' : 'object-[center_top]'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center md:items-start text-center md:text-left gap-6">
        <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter text-balance drop-shadow-lg">
          {name}
        </h1>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 font-bold tracking-widest uppercase">
          <span className="bg-surface/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 text-zinc-200">
            {plan.duration_days} {lang === 'es' ? 'días' : 'days'}
          </span>
          {plan.status !== 'active' && (
            <div className="flex items-center gap-2 text-copper drop-shadow-md">
              <span className="text-4xl font-black">${plan.price}</span>
              <span className="text-lg font-sans text-dim mt-1">USD</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
