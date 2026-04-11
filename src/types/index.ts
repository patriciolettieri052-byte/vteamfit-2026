export type PlanType = 'weeks_days' | 'modules_exercises'
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
  status: PlanStatus
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
