'use client'

import { useAppStore } from '@/store/appStore'
import { getExerciseBySlug, GLUTEOS_EXERCISES } from '@/data/gluteos-exercises'
import { agruparEjercicios } from '@/lib/trainingUtils'
import ExerciseCard from './ExerciseCard'
import CompleteDayButton from './CompleteDayButton'

export default function ExerciseList({ dayNumber, exerciseSlugs, weekNumber }: {
  dayNumber: number
  exerciseSlugs: string[]
  weekNumber: number
}) {
  const { progress, lang } = useAppStore()

  const allCompleted = exerciseSlugs.length > 0 &&
    exerciseSlugs.every(slug => progress.exerciseRecords[slug] !== undefined)

  const sections = agruparEjercicios(exerciseSlugs, dayNumber, GLUTEOS_EXERCISES, lang)

  return (
    <div className="flex flex-col gap-6 mt-8 pb-32">
      {Object.entries(sections).map(([grupo, slugs]) => (
        <div key={grupo}>
          <h3 className="text-xs font-black text-copper tracking-widest uppercase mb-3 pl-1">
            {grupo}
          </h3>
          <div className="flex flex-col gap-4">
            {slugs.map((slug) => {
              const exercise = getExerciseBySlug(slug)
              if (!exercise) return null
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
