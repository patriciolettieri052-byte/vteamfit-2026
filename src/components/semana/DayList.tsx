'use client'

import { Week } from '@/types'
import { useAppStore } from '@/store/appStore'
import DayCard from './DayCard'

export default function DayList({ weekData }: { weekData: Week }) {
  const { progress, lang } = useAppStore()

  return (
    <div className="w-full grid grid-cols-1 gap-5 px-6 pb-32 pt-6 relative z-20 overflow-hidden">
      {weekData.days.map((day) => {
        // Resolvemos si el usuario completó el día validando contra el estado global
        const isCompleted = progress.completedDays.includes(day.day_number)
        return (
          <div key={day.day_number} className="w-full">
            <DayCard 
              day={day} 
              isCompleted={isCompleted} 
              lang={lang} 
              weekNumber={weekData.week_number}
            />
          </div>
        )
      })}
    </div>
  )
}
