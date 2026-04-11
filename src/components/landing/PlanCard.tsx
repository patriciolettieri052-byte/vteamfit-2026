import Image from 'next/image'
import Link from 'next/link'
import { Plan } from '@/types'

export default function PlanCard({ plan, lang }: { plan: Plan; lang: 'es' | 'en' }) {
  const isActive = plan.status === 'active'
  const name = lang === 'es' ? plan.name_es : plan.name_en
  
  return (
    <div className={`relative flex flex-col bg-surface rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 ${isActive ? 'border-[3px] border-copper ring-4 ring-copper/10' : 'border border-white/5'}`}>
      {/* Cover Image */}
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={plan.cover_image}
          alt={name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 pb-8 -mt-16 flex flex-col flex-grow items-center text-center z-10">
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight mb-2 text-balance leading-tight">{name}</h3>
        <p className="text-zinc-400 font-medium text-sm md:text-base uppercase tracking-widest mb-6">
          {plan.duration_days} {lang === 'es' ? 'días' : 'days'}
        </p>
        
        <div className="mt-auto w-full flex flex-col items-center">
          <div className="h-[60px] flex items-center justify-center mb-6">
            <p className="text-copper font-black text-3xl tracking-tighter">
              ${plan.price} <span className="text-sm font-sans tracking-normal opacity-70">USD</span>
            </p>
          </div>

          <Link
            href={isActive ? '/dashboard' : `/planes/${plan.slug}`}
            className={`w-full max-w-[240px] text-center py-4 px-8 rounded-full font-bold uppercase tracking-widest transition-all ${
              isActive 
                ? 'bg-copper text-white shadow-[0_0_24px_rgba(255,107,74,0.3)] hover:bg-[#ff8566] hover:scale-105 active:scale-95' 
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-copper hover:text-white hover:border-transparent active:scale-95'
            }`}
          >
            {isActive 
              ? (lang === 'es' ? 'Continuar' : 'Continue') 
              : (lang === 'es' ? 'Ver plan' : 'See plan')
            }
          </Link>
        </div>
      </div>
    </div>
  )
}
