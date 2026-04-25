import { createClient } from './client'

/**
 * Obtiene las semanas y días del plan personalizado del usuario.
 * Retorna una estructura compatible con WeekRow / DayList del dashboard.
 */
export async function getCustomPlanWeeks(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_custom_plan_days')
    .select('week_number, day_number')
    .eq('user_id', userId)
    .order('week_number', { ascending: true })
    .order('day_number', { ascending: true })

  if (error) {
    console.error('Error fetching custom plan weeks:', error.message)
    return []
  }

  if (!data || data.length === 0) return []

  // Agrupar por semana y deduplicar días
  const weekMap = new Map<number, Set<number>>()
  data.forEach(row => {
    if (!weekMap.has(row.week_number)) {
      weekMap.set(row.week_number, new Set())
    }
    weekMap.get(row.week_number)!.add(row.day_number)
  })

  // Convertir al formato compatible con WeekRow (week.id, week.week_number, week.days[])
  const weeks = Array.from(weekMap.entries()).map(([weekNum, daySet]) => {
    const days = Array.from(daySet)
      .sort((a, b) => a - b)
      .map(dayNum => ({
        // id sintético — se usa en DayList para la key
        id: `custom-${userId}-w${weekNum}-d${dayNum}`,
        day_number: dayNum,
        is_rest_day: false,
        title: `Día ${dayNum}`,
        recommended: 'Entrenamiento personalizado de Vicky',
        recommended_en: 'Personalized training by Vicky',
        intensity: null,
        exercise_slugs: [],
      }))

    return {
      // id sintético
      id: `custom-${userId}-w${weekNum}`,
      week_number: weekNum,
      days,
    }
  })

  return weeks
}

/**
 * Obtiene los ejercicios de un día específico del plan personalizado.
 * Retorna estructura compatible con ExerciseList / ExerciseCard.
 */
export async function getCustomPlanDayExercises(
  userId: string,
  weekNumber: number,
  dayNumber: number
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_custom_plan_days')
    .select(`
      order_index,
      sets,
      reps,
      rest_seconds,
      notes,
      exercises (
        slug,
        name_es,
        name_en,
        description_es,
        video_url,
        thumbnail_url,
        sets,
        reps,
        rest_seconds,
        intensity,
        categoria
      )
    `)
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .eq('day_number', dayNumber)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching custom plan day exercises:', error.message)
    return []
  }

  // Normalizar al mismo formato que getDayExercises() de queries.ts
  return (data ?? []).map(row => {
    const exercise = Array.isArray(row.exercises) ? row.exercises[0] : row.exercises
    return {
      position: row.order_index,
      // Sobreescribir sets/reps con los valores de Vicky para este usuario
      exercise: {
        ...exercise,
        sets: row.sets ?? exercise?.sets ?? 3,
        reps: row.reps ?? exercise?.reps ?? '12',
        rest_seconds: row.rest_seconds ?? exercise?.rest_seconds ?? 60,
        // Campo extra: notas de Vicky para este usuario específico
        vickyNotes: row.notes ?? null,
      },
    }
  })
}
