'use client'

import { Week } from '@/types'
import { useAppStore } from '@/store/appStore'
import DayCard from './DayCard'

export default function DayList({ weekData }: { weekData: Week }) {
  const { progress, lang } = useAppStore()

  return (
    <div className="w-full flex flex-col gap-5 px-6 pb-12 -mt-10 relative z-20">
      {weekData.days.map((day) => {
        // Resolvemos si el usuario completó el día validando contra el estado global
        const isCompleted = progress.completedDays.includes(day.day_number)
        return (
          <DayCard 
            key={day.day_number} 
            day={day} 
            isCompleted={isCompleted} 
            lang={lang} 
            weekNumber={weekData.week_number}
          />
        )
      })}
    </div>
  )
}
