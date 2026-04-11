'use client'

import { useAppStore } from '@/store/appStore'
import { GLUTEOS_SCHEDULE } from '@/data/gluteos-schedule'
import WeekRow from './WeekRow'

export default function WeekList() {
  const { progress, lang } = useAppStore()
  
  // En la demo asignamos GLUTEOS_SCHEDULE fijo para ilustrar estructura de UI
  const schedule = GLUTEOS_SCHEDULE

  // Lógica: Mostrar semanas donde el week_number es menor o igual a currentWeek.
  // Las semanas futuras desaparecen de la vista.
  const visibleWeeks = schedule.filter(w => w.week_number <= progress.currentWeek)

  return (
    <div className="w-full flex flex-col gap-5 mt-8">
      <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] pl-2 mb-1">
        {lang === 'es' ? 'Tu Progreso' : 'Your Progress'}
      </h2>
      
      {/* Mostramos las semanas por orden cronológico */}
      {visibleWeeks.map(week => (
        <WeekRow 
          key={week.week_number} 
          week={week} 
          isActive={week.week_number === progress.currentWeek}
          isPast={week.week_number < progress.currentWeek}
        />
      ))}
    </div>
  )
}
