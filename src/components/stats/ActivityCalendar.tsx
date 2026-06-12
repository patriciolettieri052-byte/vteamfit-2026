'use client'

import { useAppStore } from '@/store/appStore'

export default function ActivityCalendar({ lang }: { lang: 'es' | 'en' }) {
  const { progress } = useAppStore()
  const TOTAL_DAYS = 84 // 12 weeks
  const daysArray = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)

  return (
    <div className="w-full bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
      <div className="flex justify-between items-center mb-8 px-2">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
          {lang === 'es' ? 'Calendario Anual' : 'Activity Calendar'}
        </h3>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-copper" />
                <span className="text-[10px] font-black text-zinc-500 uppercase">{lang === 'es' ? 'Entrenado' : 'Done'}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-carbon" />
                <span className="text-[10px] font-black text-zinc-500 uppercase">{lang === 'es' ? 'Faltante' : 'Missing'}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {daysArray.map((day) => {
          const isCompleted = progress.completedDays.includes(day)
          const isFuture = day > (progress.currentWeek * 7) // Simple logic for demo visibility

          return (
            <div
              key={day}
              className={`aspect-square rounded-sm transition-all duration-500 ${
                isCompleted 
                  ? 'bg-copper shadow-[0_0_8px_rgba(255,107,74,0.4)]' 
                  : isFuture ? 'bg-carbon/30 border border-white/5 opacity-30' : 'bg-carbon'
              }`}
              title={`Dia ${day}`}
            />
          )
        })}
      </div>
      
      {progress.completedDays.length === 0 && (
        <p className="text-copper text-[11px] font-black text-center mt-6 animate-pulse uppercase tracking-wider">
          {lang === 'es' ? '¡Completá tu primer día para ver tu progreso! 💪' : 'Complete your first day to see your progress! 💪'}
        </p>
      )}
      
      <p className="mt-8 text-center text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
        {lang === 'es' ? '12 Semanas de Transformación' : '12 Weeks Transformation'}
      </p>
    </div>
  )
}
