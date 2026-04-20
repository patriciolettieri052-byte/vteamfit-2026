'use client'

import { use, useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'
import { getDayExercises } from '@/lib/supabase/queries'
import VideoPlayer from '@/components/ejercicio/VideoPlayer'
import ExerciseInfo from '@/components/ejercicio/ExerciseInfo'
import SetsRepsDisplay from '@/components/ejercicio/SetsRepsDisplay'
import SessionTimer from '@/components/ejercicio/SessionTimer'
import ExerciseForm from '@/components/ejercicio/ExerciseForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EjercicioPage({ params }: { params: Promise<{ week: string, day: string, slug: string }> }) {
  const resolvedParams = use(params)
  const { week, day, slug } = resolvedParams
  const weekNum = parseInt(week, 10)
  const dayNum = parseInt(day, 10)
  const router = useRouter()
  
  const { lang, addSessionDuration, currentPlanId } = useAppStore()
  const [exercise, setExercise] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExerciseData() {
      if (!currentPlanId) {
        router.push('/dashboard')
        return
      }

      try {
        // Obtenemos todos los ejercicios del día y buscamos el que coincida con el slug
        // Primero necesitamos el dayId. Lo buscamos en la jerarquía (podríamos optimizar queries.ts después)
        // Por ahora, usaremos getDayExercises si tuviéramos el dayId, pero EjercicioPage solo tiene el slug.
        // Necesitamos una query para obtener el ejercicio por slug o buscar en el día.
        // PERO el contrato dice que EjercicioPage tiene context de week/day.
        // Vamos a implementar una búsqueda rápida.
        
        // Fetch dayId first (we don't have it in params, only dayNumber)
        // Re-using the logic from DiaDetallePage or adding a new query.
        // Let's use a simpler approach for now:
        const { getWeeks } = await import('@/lib/supabase/queries')
        const weeks = await getWeeks(currentPlanId)
        const weekFound = weeks.find(w => w.week_number === weekNum)
        const dayFound = weekFound?.days.find((d: any) => d.day_number === dayNum)
        
        if (dayFound) {
          const exercises = await getDayExercises(dayFound.id)
          const found = exercises.find(ex => ex.exercise.slug === slug)
          if (found) {
            setExercise(found.exercise)
          }
        }
      } catch (error) {
        console.error('Error fetching exercise:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchExerciseData()
  }, [currentPlanId, weekNum, dayNum, slug, router])

  if (isNaN(weekNum) || isNaN(dayNum)) {
    notFound()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <LoadingSpinner />
      </div>
    )
  }

  if (!exercise) {
    notFound()
  }

  const handleTimeUpdate = (minutes: number) => {
    addSessionDuration(dayNum, minutes)
  }

  // Construct Bunny URL
  const bunnyBase = process.env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://vteamfit-app.b-cdn.net'
  const finalVideoUrl = exercise.video_url.startsWith('http') 
    ? exercise.video_url 
    : `${bunnyBase}/${exercise.video_url}`

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full relative selection:bg-copper selection:text-white">
      {/* Back button */}
      <Link 
        href={`/dashboard/semana/${week}/dia/${day}`} 
        className="absolute top-6 left-6 z-50 bg-black/40 backdrop-blur-xl w-14 h-14 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 hover:-translate-x-1 transition-all shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </Link>

      <div className="p-6 flex flex-col gap-6 pt-24">
        <ExerciseInfo exercise={exercise} lang={lang} dayNumber={dayNum} />

        <VideoPlayer videoUrl={finalVideoUrl} />
        
        <SetsRepsDisplay 
          sets={exercise.sets || 3} 
          reps={exercise.reps || '12'} 
          dayNumber={dayNum} 
          lang={lang} 
        />
        
        <SessionTimer 
          dayNumber={dayNum} 
          onTimeUpdate={handleTimeUpdate} 
          lang={lang} 
        />
        
        <ExerciseForm 
          slug={slug}
          defaultSets={exercise.sets || 3}
          defaultReps={exercise.reps || '12'}
          week={weekNum}
          day={dayNum}
          lang={lang}
        />
      </div>
    </main>
  )
}
