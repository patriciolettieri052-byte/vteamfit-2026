import Link from 'next/link'
import { Week } from '@/types'
import { useAppStore } from '@/store/appStore'

export default function WeekRow({ week, isActive, isPast }: { week: Week, isActive: boolean, isPast: boolean }) {
  const { lang, progress } = useAppStore()
  
  const completedDays = week.days.filter(d => progress.completedDays.includes(d.day_number)).length
  const totalDays = week.days.length
  const progressPercent = Math.round((completedDays / totalDays) * 100)
  
  const weekLabel = lang === 'es' ? `Semana ${week.week_number}` : `Week ${week.week_number}`
  
  if (isActive) {
    return (
      <div className="bg-surface rounded-3xl p-6 border-[3px] border-copper shadow-[0_0_24px_rgba(255,107,74,0.15)] flex flex-col gap-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <span className="text-copper font-black tracking-widest uppercase text-xs mb-1 block">
              {lang === 'es' ? 'Semana Actual' : 'Current Week'}
            </span>
            <h3 className="text-2xl font-black text-white italic uppercase">{weekLabel}</h3>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-white font-black text-xl">{completedDays}/{totalDays}</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {lang === 'es' ? 'Días' : 'Days'}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-carbon rounded-full overflow-hidden relative z-10">
          <div 
            className="h-full bg-copper rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <Link 
          href={`/dashboard/semana/${week.week_number}`}
          className="w-full bg-copper text-white text-center font-bold tracking-widest uppercase py-4 rounded-xl shadow-[0_4px_16px_rgba(255,107,74,0.3)] hover:bg-[#ff8566] transition-all hover:scale-[1.02] active:scale-95 relative z-10"
        >
          {lang === 'es' ? 'Continuar' : 'Continue'}
        </Link>
      </div>
    )
  }

  if (isPast) {
    return (
      <div className="bg-surface/50 rounded-2xl p-6 border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity duration-300">
        <div>
          <h3 className="text-xl font-bold text-zinc-300 uppercase italic">{weekLabel}</h3>
          <span className="text-emerald-500/80 text-xs font-bold tracking-widest uppercase mt-1 block flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {lang === 'es' ? 'Completada' : 'Completed'}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-zinc-400 font-bold">{completedDays}/{totalDays}</span>
          <Link 
            href={`/dashboard/semana/${week.week_number}`}
            className="w-12 h-12 rounded-full bg-carbon flex items-center justify-center text-zinc-400 hover:text-white hover:bg-copper transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  return null
}
