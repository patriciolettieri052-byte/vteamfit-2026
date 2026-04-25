export type PlanType = 'weeks_days' | 'modules_exercises' | 'custom'
export type PlanStatus = 'not_purchased' | 'active' | 'expired' | 'completed'
export type Intensity = 'FUERTE' | 'MEDIO' | 'SUAVE' | null
export type ExerciseIntensity = 'high' | 'medium' | 'low'

export interface Plan {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string
  description_en: string
  price: number
  duration_days: number
  plan_type: PlanType
  cover_image: string
  billing_cycle_es?: string
  billing_cycle_en?: string
  /** Badge especial para planes personalizados, ej: "PERSONALIZADO" */
  badge_es?: string
  badge_en?: string
  status: PlanStatus
}

/** Respuestas del onboarding de "Entrena Conmigo" */
export interface CustomOnboardingAnswers {
  objetivo: string
  dias_por_semana: number
  acceso_gimnasio: string
  limitaciones: string
}

/** Fila de user_custom_plan_days (con join a exercises) */
export interface CustomPlanDay {
  id: string
  user_id: string
  week_number: number
  day_number: number
  exercise_slug: string
  sets: number
  reps: string
  rest_seconds: number
  order_index: number
  notes?: string
  exercises?: {
    slug: string
    name_es: string
    description_es: string
    categoria: string
    video_url: string
    thumbnail_url: string
    sets: number
    reps: string
    rest_seconds: number
  }
}

export interface Exercise {
  slug: string
  name_es: string
  name_en: string
  description_es: string
  description_en?: string
  video_url: string
  thumbnail_url: string
  sets: number
  reps: string
  rest_seconds: number
  intensity: ExerciseIntensity
  categoria: string
  completed?: boolean
}

export interface Day {
  day_number: number
  is_rest_day: boolean
  title: string
  recommended: string
  recommended_en?: string
  intensity: Intensity
  exercise_slugs: string[]
}

export interface Week {
  week_number: number
  days: Day[]
}

export interface UserProgress {
  planSlug: string
  currentWeek: number
  completedDays: number[]
  exerciseRecords: Record<string, { sets: number; reps: string; weight: number }>
  weightHistory: { date: string; weight: number }[]
  sessionDuration: Record<number, number>
}
