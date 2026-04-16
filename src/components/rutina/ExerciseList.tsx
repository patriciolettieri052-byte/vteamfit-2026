'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { getDayExercises } from '@/lib/supabase/queries'
import ExerciseCard from './ExerciseCard'
import CompleteDayButton from './CompleteDayButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ExerciseList({ dayNumber, dayId, weekNumber }: {
  dayNumber: number
  dayId: string
  weekNumber: number
}) {
  const { progress, lang } = useAppStore()
  const [exercisesData, setExercisesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExercises() {
      try {
        const data = await getDayExercises(dayId)
        setExercisesData(data)
      } catch (error) {
        console.error('Error fetching exercises:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchExercises()
  }, [dayId])

  if (loading) return <div className="py-10 flex justify-center"><LoadingSpinner /></div>

  const exerciseSlugs = exercisesData.map(row => row.exercise.slug)
  const allCompleted = exerciseSlugs.length > 0 &&
    exerciseSlugs.every(slug => progress.exerciseRecords[slug] !== undefined)

  // Group by category if present
  const sections: Record<string, any[]> = {}
  exercisesData.forEach(row => {
    const cat = lang === 'es' ? (row.exercise.categoria || 'Ejercicios') : (row.exercise.categoria_en || row.exercise.categoria || 'Exercises')
    if (!sections[cat]) sections[cat] = []
    sections[cat].push(row.exercise)
  })

  return (
    <div className="flex flex-col gap-6 mt-8 pb-32">
      {Object.entries(sections).map(([grupo, exercises]) => (
        <div key={grupo}>
          <h3 className="text-xs font-black text-copper tracking-widest uppercase mb-3 pl-1">
            {grupo}
          </h3>
          <div className="flex flex-col gap-4">
            {exercises.map((exercise) => {
              const slug = exercise.slug
              const isCompleted = progress.exerciseRecords[slug] !== undefined
              return (
                <ExerciseCard
                  key={slug}
                  exercise={exercise}
                  isCompleted={isCompleted}
                  slugInfo={{ week: weekNumber, day: dayNumber, slug }}
                />
              )
            })}
          </div>
        </div>
      ))}
      <CompleteDayButton dayNumber={dayNumber} allCompleted={allCompleted} weekNumber={weekNumber} />
    </div>
  )
}
