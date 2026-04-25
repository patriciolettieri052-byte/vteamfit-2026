'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { getWeeks } from '@/lib/supabase/queries'
import { getCustomPlanWeeks } from '@/lib/supabase/customPlanQueries'
import { isWeekUnlocked, getCurrentWeek } from '@/lib/utils/planUtils'
import WeekRow from './WeekRow'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function WeekList() {
  const { progress, lang, currentPlanId, currentPlanSlug, userId, startedAt, isTester } = useAppStore()
  const [weeks, setWeeks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadWeeks() {
      if (!currentPlanId && currentPlanSlug !== 'entrena-conmigo') {
        setLoading(false)
        return
      }
      try {
        // Plan personalizado: usa user_custom_plan_days
        if (currentPlanSlug === 'entrena-conmigo' && userId) {
          const data = await getCustomPlanWeeks(userId)
          setWeeks(data)
        } else if (currentPlanId) {
          const data = await getWeeks(currentPlanId)
          setWeeks(data)
        }
      } catch (error) {
        console.error('Error fetching weeks:', error)
      } finally {
        setLoading(false)
      }
    }
    loadWeeks()
  }, [currentPlanId, currentPlanSlug, userId])

  if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>

  // Para el plan custom, todas las semanas están desbloqueadas (Vicky controla el contenido)
  const isCustomPlan = currentPlanSlug === 'entrena-conmigo'

  // CURRENT WEEK: La más alta desbloqueada
  const currentWeekNum = isCustomPlan
    ? (weeks[weeks.length - 1]?.week_number ?? 1)
    : getCurrentWeek(weeks, startedAt, isTester)

  // Solo mostrar semanas desbloqueadas (custom → todas; normal → por tiempo)
  const visibleWeeks = isCustomPlan
    ? weeks
    : weeks.filter(w => isWeekUnlocked(w.week_number, startedAt, isTester))

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
