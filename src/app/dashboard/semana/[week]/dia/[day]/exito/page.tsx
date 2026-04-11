'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { GLUTEOS_SCHEDULE } from '@/data/gluteos-schedule'
import ConfettiAnimation from '@/components/exito/ConfettiAnimation'
import DaySummary from '@/components/exito/DaySummary'

export default function ExitoPage({ params }: { params: Promise<{ week: string, day: string }> }) {
  const resolvedParams = use(params)
  const weekNum = parseInt(resolvedParams.week, 10)
  const dayNum = parseInt(resolvedParams.day, 10)
  
  const { lang, completeDay } = useAppStore()
  const router = useRouter()

  // Mark as completed on mount
  useEffect(() => {
    completeDay(dayNum)
  }, [dayNum, completeDay])

  const weekData = GLUTEOS_SCHEDULE.find(w => w.week_number === weekNum)
  const dayData = weekData?.days.find(d => d.day_number === dayNum)
  const exercisesCount = dayData?.exercise_slugs.length || 0

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full relative flex flex-col items-center justify-center p-6 pb-24">
      <ConfettiAnimation />
      
      <DaySummary 
        dayNum={dayNum} 
        exercisesCount={exercisesCount} 
        lang={lang} 
      />

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
