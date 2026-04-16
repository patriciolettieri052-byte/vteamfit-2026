'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { getWeeks } from '@/lib/supabase/queries'
import { isWeekUnlocked, getCurrentWeek } from '@/lib/utils/planUtils'
import WeekRow from './WeekRow'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function WeekList() {
  const { progress, lang, currentPlanId, startedAt, isTester } = useAppStore()
  const [weeks, setWeeks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadWeeks() {
      if (!currentPlanId) return
      try {
        const data = await getWeeks(currentPlanId)
        setWeeks(data)
      } catch (error) {
        console.error('Error fetching weeks:', error)
      } finally {
        setLoading(false)
      }
    }
    loadWeeks()
  }, [currentPlanId])

  if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>

  // CURRENT WEEK: La más alta desbloqueada
  const currentWeekNum = getCurrentWeek(weeks, startedAt, isTester)

  // Solo mostrar semanas desbloqueadas (is_tester=true las desbloquea todas)
  const visibleWeeks = weeks.filter(w => isWeekUnlocked(w.week_number, startedAt, isTester))

  return (
    <div className="w-full flex flex-col gap-5 mt-8">
      <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] pl-2 mb-1">
        {lang === 'es' ? 'Tu Progreso' : 'Your Progress'}
      </h2>
      
      {visibleWeeks.length === 0 && (
        <p className="text-zinc-500 text-sm px-2 italic">
          {lang === 'es' ? 'No hay semanas disponibles aún.' : 'No weeks available yet.'}
        </p>
      )}

      {/* Mostramos las semanas por orden cronológico */}
      {visibleWeeks.map(week => (
        <WeekRow 
          key={week.id} 
          week={week} 
          isActive={week.week_number === currentWeekNum}
          isPast={week.week_number < currentWeekNum}
        />
      ))}
    </div>
  )
}
