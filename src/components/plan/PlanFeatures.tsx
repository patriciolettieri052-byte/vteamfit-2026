import { Plan } from '@/types'

export default function PlanFeatures({ plan, lang }: { plan: Plan; lang: string }) {
  const description = lang === 'es' ? plan.description_es : plan.description_en
  
  return (
    <section className="bg-carbon py-12 md:py-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        
        {/* Main description block */}
        <div className="bg-surface rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-copper/10 blur-[60px] rounded-full pointer-events-none" />
          
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight mb-6 relative z-10">
            {lang === 'es' ? 'Acerca de este plan' : 'About this plan'}
          </h2>
          <p className="text-lg md:text-xl text-zinc-300 leading-relaxed md:leading-loose relative z-10">
            {description}
          </p>
        </div>

        {/* Static generic feature boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface/50 rounded-2xl p-8 border border-white/5 flex flex-col gap-4">
            <h3 className="text-copper font-black uppercase tracking-widest text-sm md:text-base">
              {lang === 'es' ? 'MetodologÃ­a' : 'Methodology'}
            </h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              {lang === 'es' 
                ? 'Rutinas progresivas enfocadas en resultados reales. Estructuradas para desafiarte durante todo el proceso.' 
                : 'Progressive routines focused on real results. Structured to challenge you throughout the process.'}
            </p>
          </div>
          
          <div className="bg-surface/50 rounded-2xl p-8 border border-white/5 flex flex-col gap-4">
            <h3 className="text-copper font-black uppercase tracking-widest text-sm md:text-base">
              {lang === 'es' ? 'Sistema' : 'System'}
            </h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              {lang === 'es' 
                ? 'Semanalmente tendrÃ¡s nuevos retos a desbloquear, seguimiento de pesos e historial.' 
                : 'Weekly you will have new challenges to unlock, weight tracking and history.'}
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
