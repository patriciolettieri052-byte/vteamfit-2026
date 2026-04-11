'use client'

import { useAppStore } from '@/store/appStore'
import ProgressRing from '@/components/stats/ProgressRing'
import StreakCounter from '@/components/stats/StreakCounter'
import WeightChart from '@/components/stats/WeightChart'
import ActivityCalendar from '@/components/stats/ActivityCalendar'
import WeightPrompt from '@/components/stats/WeightPrompt'

export default function StatsPage() {
  const { lang, progress } = useAppStore()
  const TOTAL_PLAN_DAYS = 84

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full px-6 pt-12 pb-12 flex flex-col gap-10">
      <header>
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-1">
          {lang === 'es' ? 'Tus Números' : 'Your Stats'}
        </h1>
        <p className="text-zinc-500 font-medium text-sm border-l-2 border-copper pl-4 ml-1">
          {lang === 'es' 
            ? 'El progreso es la suma de pequeños esfuerzos repetidos día tras día.' 
            : 'Progress is the sum of small efforts repeated day after day.'}
        </p>
      </header>

      {/* Hero Stats: Progress Ring and Streak */}
      <section className="flex flex-col gap-8">
        <ProgressRing completed={progress.completedDays.length} total={TOTAL_PLAN_DAYS} lang={lang} />
        <StreakCounter lang={lang} />
      </section>

      {/* Weight History Chart */}
      <section>
        <WeightChart lang={lang} />
      </section>

      {/* Activity Map */}
      <section>
        <ActivityCalendar lang={lang} />
      </section>

      {/* Weight Update Prompt (Conditional Logic inside) */}
      <WeightPrompt lang={lang} />
    </main>
  )
}
