'use client'

import { use, useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'
import { getWeeks } from '@/lib/supabase/queries'
import SemanaHero from '@/components/semana/SemanaHero'
import DayList from '@/components/semana/DayList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function SemanaPage({ params }: { params: Promise<{ week: string }> }) {
  const resolvedParams = use(params)
  const weekNumber = parseInt(resolvedParams.week, 10)
  const router = useRouter()
  const { lang, currentPlanId } = useAppStore()
  
  const [weekData, setWeekData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeekData() {
      if (!currentPlanId) {
        // Si no hay plan en el store, probablemente entró directo. Redirigir al dashboard para hidratar.
        router.push('/dashboard')
        return
      }

      try {
        const weeks = await getWeeks(currentPlanId)
        const found = weeks.find(w => w.week_number === weekNumber)
        if (found) {
          setWeekData(found)
        } else {
          setWeekData(null)
        }
      } catch (error) {
        console.error('Error fetching week:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWeekData()
  }, [currentPlanId, weekNumber, router])

  if (isNaN(weekNumber)) {
    notFound()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <LoadingSpinner />
      </div>
    )
  }

  if (!weekData) {
    notFound()
  }

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
