'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { GLUTEOS_SCHEDULE } from '@/data/gluteos-schedule'
import { useAppStore } from '@/store/appStore'
import SemanaHero from '@/components/semana/SemanaHero'
import DayList from '@/components/semana/DayList'

export default function SemanaPage({ params }: { params: Promise<{ week: string }> }) {
  const resolvedParams = use(params)
  const weekNumber = parseInt(resolvedParams.week, 10)
  const { lang } = useAppStore()
  
  if (isNaN(weekNumber)) {
    notFound()
  }

  // Obtenemos la semana en cuestion.
  const weekData = GLUTEOS_SCHEDULE.find(w => w.week_number === weekNumber)

  if (!weekData) {
    notFound()
  }

  // Notar que omitimos Layout inferior <BottomNav /> local acá si el usuario está enfocado
  // Pero el dashboard/layout renderiza BottomNav automáticamente para todas sus subrutas.

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full relative selection:bg-copper selection:text-white">
      {/* Back button */}
      <Link 
        href="/dashboard" 
        className="absolute top-6 left-6 z-50 bg-black/40 backdrop-blur-xl w-14 h-14 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 hover:-translate-x-1 transition-all shadow-xl"
        aria-label="Volver"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </Link>
      
      <SemanaHero week={weekData.week_number} lang={lang} />
      <DayList weekData={weekData} />
    </main>
  )
}
