'use client'

import { use, useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'
import { getWeeks } from '@/lib/supabase/queries'
import { getCustomPlanDayExercises } from '@/lib/supabase/customPlanQueries'
import ExerciseList from '@/components/rutina/ExerciseList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Resolucion dinamica requerida por next 15+ App router pages
export default function DiaDetallePage({ params }: { params: Promise<{ week: string, day: string }> }) {
  const resolvedParams = use(params)
  const weekNumber = parseInt(resolvedParams.week, 10)
  const dayNumber = parseInt(resolvedParams.day, 10)
  const router = useRouter()
  const { lang, progress, currentPlanId, currentPlanSlug, userId } = useAppStore()

  const [dayData, setDayData] = useState<any>(null)
  // Para plan custom: ejercicios ya cargados con notas de Vicky
  const [customExercises, setCustomExercises] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDayData() {
      const isCustomPlan = currentPlanSlug === 'entrena-conmigo'

      if (!currentPlanId && !isCustomPlan) {
        router.push('/dashboard')
        return
      }

      try {
        if (isCustomPlan && userId) {
          // Plan personalizado: cargar ejercicios directamente desde user_custom_plan_days
          const exercises = await getCustomPlanDayExercises(userId, weekNumber, dayNumber)
          setCustomExercises(exercises)
          setDayData({
            id: `custom-${userId}-w${weekNumber}-d${dayNumber}`,
            day_number: dayNumber,
            is_rest_day: exercises.length === 0,
            title: `Día ${dayNumber}`,
            recommended: 'Entrenamiento personalizado de Vicky',
            intensity: null,
          })
        } else {
          const weeks = await getWeeks(currentPlanId!)
          const week = weeks.find(w => w.week_number === weekNumber)
          const day = week?.days.find((d: any) => d.day_number === dayNumber)
          setDayData(day ?? null)
        }
      } catch (error) {
        console.error('Error fetching day:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDayData()
  }, [currentPlanId, currentPlanSlug, userId, weekNumber, dayNumber, router])

  if (isNaN(weekNumber) || isNaN(dayNumber)) {
    notFound()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <LoadingSpinner />
      </div>
    )
  }

  if (!dayData) {
    notFound()
  }

  // Estética para el header
  const dayName = lang === 'es' 
    ? (dayData.title.includes('·') ? dayData.title.split('·')[1].trim() : dayData.title)
    : `Day ${dayNumber}`
  const weekName = lang === 'es' ? `Semana ${weekNumber}` : `Week ${weekNumber}`

  // ¿El día completo entero está en la DB del usuario?
  const isDayCompletedInStore = progress.completedDays.includes(dayNumber)

  return (
    <main className="min-h-screen max-w-md mx-auto w-full relative selection:bg-copper selection:text-white pb-safe">
      {/* Floating Header sticky */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex items-center justify-between shadow-2xl">
        <Link 
          href={`/dashboard/semana/${weekNumber}`}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-surface border border-white/10 text-white hover:bg-copper hover:border-copper transition-colors shadow-lg active:scale-95"
          aria-label="Volver a la semana"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <div className="text-center">
          <span className="text-copper text-[10px] font-black tracking-[0.2em] uppercase block mb-0.5">
            {weekName}
          </span>
          <h1 className="text-2xl font-black text-white italic uppercase">{dayName}</h1>
        </div>
        <div className="w-12 h-12 flex items-center justify-center">
          {isDayCompletedInStore && (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          )}
        </div>
      </header>

      <section className="px-6 relative">
        <div className="mt-8 mb-4">
          <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest pl-1 mb-1">
            {lang === 'es' ? 'Circuitos del Día' : 'Daily Circuits'}
          </h2>
          <p className="text-zinc-400 text-sm font-medium pl-1">
            {lang === 'es' ? dayData.recommended : (dayData.recommended_en || dayData.recommended)}
          </p>
        </div>

        {/* Bifurcacion condicional si el dia en cuestion es el de Descanso o uno funcional */}
        {dayData.is_rest_day ? (
          <div className="flex flex-col items-center justify-center bg-surface border border-white/5 rounded-[2rem] mt-10 p-10 text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]">
             <div className="text-copper mb-8">
                <svg 
                  className="w-20 h-20 animate-[spin_3s_linear_infinite]" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                    className="opacity-20" 
                  />
                  <path 
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    className="drop-shadow-[0_0_12px_rgba(137,116,73,0.8)]"
                  />
                  <circle cx="12" cy="2" r="1.5" fill="currentColor" />
                </svg>
             </div>
             <h3 className="text-2xl font-black text-white italic uppercase mb-2">
               {lang === 'es' ? 'Día de Descanso' : 'Rest Day'}
             </h3>
             <p className="text-zinc-500 font-medium text-[15px] leading-relaxed">
               {lang === 'es' 
                ? 'El músculo crece cuando descansas. Tómate el día libre, hidrátate y come bien.' 
                : 'Muscles grow when you rest. Take the day off, hydrate and eat well.'}
             </p>
          </div>
        ) : (
          <ExerciseList 
            dayId={dayData.id}
            dayNumber={dayNumber} 
            weekNumber={weekNumber}
            customExercises={customExercises}
          />
        )}
      </section>
    </main>
  )
}
