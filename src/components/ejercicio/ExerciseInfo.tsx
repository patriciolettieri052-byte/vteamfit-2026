import { Exercise } from '@/types'
import IntensityBar from '@/components/rutina/IntensityBar'

const CATEGORIA_LABELS: Record<string, string> = {
  'gluteos': 'Glúteos',
  'cuadriceps': 'Cuádriceps',
  'isquios': 'Isquiotibiales',
  'espalda': 'Espalda',
  'pecho': 'Pecho',
  'hombros': 'Hombros',
  'biceps': 'Bíceps',
  'triceps': 'Tríceps',
  'gemelos': 'Gemelos',
  'abdominales': 'Abdominales',
  'abductores': 'Abductores',
  'aductores': 'Aductores',
  'antebrazo': 'Antebrazo',
  'cardio': 'Cardio',
  'movilidad': 'Movilidad',
  'estiramientos': 'Estiramientos',
  'padel': 'Pádel',
  'funcional': 'Funcional',
}

export default function ExerciseInfo({ 
  exercise, 
  lang,
  dayNumber
}: { 
  exercise: Exercise, 
  lang: 'es' | 'en',
  dayNumber: number
}) {
  const categoryLabel = exercise.categoria ? (CATEGORIA_LABELS[exercise.categoria.toLowerCase()] || exercise.categoria) : null
  const showBadge = exercise.categoria && exercise.categoria.toLowerCase() !== 'general'

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
          {lang === 'es' ? exercise.name_es : exercise.name_en}
        </h1>
        <div className="shrink-0 pt-2">
          <IntensityBar intensity={exercise.intensity as 'high' | 'medium' | 'low'} />
        </div>
      </div>

      {/* Badge de categoría */}
      {showBadge && categoryLabel && (
        <div className="mt-1">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] 
                          uppercase tracking-widest font-bold
                          bg-surface text-copper border border-copper/30">
            {categoryLabel}
          </span>
        </div>
      )}
      
      {/* Descripción */}
      {exercise.description_es && (
        <p className="text-zinc-400 font-medium leading-relaxed mt-2 text-sm">
          {lang === 'es' ? exercise.description_es : (exercise.description_en || exercise.description_es)}
        </p>
      )}
    </div>
  )
}
