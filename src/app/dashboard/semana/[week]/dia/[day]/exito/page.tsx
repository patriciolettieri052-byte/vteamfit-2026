'use client'

import { useEffect, use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { getWeeks, getDayExercises, persistDayComplete } from '@/lib/supabase/queries'
import ConfettiAnimation from '@/components/exito/ConfettiAnimation'
import DaySummary from '@/components/exito/DaySummary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ExitoPage({ params }: { params: Promise<{ week: string, day: string }> }) {
  const resolvedParams = use(params)
  const weekNum = parseInt(resolvedParams.week, 10)
  const dayNum = parseInt(resolvedParams.day, 10)
  
  const { lang, completeDay, currentPlanId, currentPlanSlug, userId } = useAppStore()
  const router = useRouter()
  const [exercisesCount, setExercisesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Mark as completed on mount + persist to Supabase
  useEffect(() => {
    completeDay(dayNum)
    // Persist in background
    if (userId && currentPlanSlug) {
      persistDayComplete(userId, currentPlanSlug, dayNum).catch(err =>
        console.error('Failed to persist day completion:', err)
      )
    }
  }, [dayNum, completeDay, userId, currentPlanSlug])

  // Fetch real exercise count from Supabase
  useEffect(() => {
    async function fetchExerciseCount() {
      if (!currentPlanId) {
        setLoading(false)
        return
      }

      try {
        const weeks = await getWeeks(currentPlanId)
        const weekFound = weeks.find(w => w.week_number === weekNum)
        const dayFound = weekFound?.days.find((d: any) => d.day_number === dayNum)

        if (dayFound) {
          const exercises = await getDayExercises(dayFound.id)
          setExercisesCount(exercises.length)
        }
      } catch (error) {
        console.error('Error fetching exercise count:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchExerciseCount()
  }, [currentPlanId, weekNum, dayNum])

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full relative flex flex-col items-center justify-center p-6 pb-24">
      <ConfettiAnimation />
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DaySummary 
          dayNum={dayNum} 
          exercisesCount={exercisesCount} 
          lang={lang} 
        />
      )}

      <div className="fixed bottom-[88px] left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-40 md:static md:bg-transparent md:border-none md:p-8 md:mt-10 md:flex md:justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-1000 flex justify-center">
        <button 
          onClick={() => router.push('/dashboard')}
          className="w-max bg-white text-black font-black text-lg uppercase tracking-widest py-4 px-8 rounded-full shadow-[0_0_32px_rgba(255,255,255,0.1)] hover:bg-[#f0f0f0] transition-all hover:scale-105 active:scale-95"
        >
          {lang === 'es' ? 'Volver al Dashboard' : 'Back to Dashboard'}
        </button>
      </div>
    </main>
  )
}
