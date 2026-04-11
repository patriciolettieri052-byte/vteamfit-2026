import { Exercise } from '@/types'
import IntensityBar from '@/components/rutina/IntensityBar'
import { getGrupoMuscular } from '@/lib/trainingUtils'
import { GLUTEOS_EXERCISES } from '@/data/gluteos-exercises'

export default function ExerciseInfo({ 
  exercise, 
  lang,
  dayNumber
}: { 
  exercise: Exercise, 
  lang: 'es' | 'en',
  dayNumber: number
}) {
  const grupo = getGrupoMuscular(exercise.slug, dayNumber, GLUTEOS_EXERCISES, lang)

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-zinc-500 font-black tracking-widest uppercase text-[10px] mb-1 block">
            {grupo}
          </span>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            {lang === 'es' ? exercise.name_es : exercise.name_en}
          </h1>
        </div>
        <div className="shrink-0 pt-2">
          <IntensityBar intensity={exercise.intensity as 'high' | 'medium' | 'low'} />
        </div>
      </div>
      
      <p className="text-zinc-400 font-medium leading-relaxed">
        {lang === 'es' ? exercise.description_es : (exercise.description_en || exercise.description_es)}
      </p>
    </div>
  )
}
