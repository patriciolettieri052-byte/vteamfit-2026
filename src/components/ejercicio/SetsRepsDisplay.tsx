import { getMonthRecommendation } from '@/lib/constants'

export default function SetsRepsDisplay({ sets, reps, dayNumber, lang }: { sets: number, reps: string, dayNumber: number, lang: string }) {
  const monthRec = getMonthRecommendation(dayNumber, lang)

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Target Box */}
      <div className="bg-surface p-6 rounded-[2rem] border border-white/5 shadow-xl">
        <span className="text-copper font-black tracking-widest uppercase text-[10px] mb-3 block">
          {lang === 'es' ? 'Objetivo Sugerido' : 'Suggested Target'}
        </span>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white italic">{sets}</span>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{lang === 'es' ? 'Series' : 'Sets'}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white italic">{reps}</span>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{lang === 'es' ? 'Reps' : 'Reps'}</span>
          </div>
        </div>
      </div>

      {/* Mes Recommendation Box */}
      <div className="bg-copper/5 p-6 rounded-[2rem] border border-copper/20 shadow-xl flex flex-col justify-center">
        <span className="text-copper font-black tracking-widest uppercase text-[10px] mb-2 block">
          {lang === 'es' ? 'RecomendaciÃ³n del Mes' : 'Monthly Tip'}
        </span>
        <p className="text-white font-bold text-sm leading-tight italic">
          "{monthRec}"
        </p>
      </div>
    </div>
  )
}
