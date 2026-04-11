import { create } from 'zustand'
import { UserProgress } from '@/types'

interface AppState {
  // Configuración global
  lang: 'es' | 'en'
  setLang: (lang: 'es' | 'en') => void

  // Usuario mock
  userName: string
  userWeight: number
  currentPlanSlug: string
  
  // Progreso del plan activo
  progress: UserProgress
  
  // Acciones
  completeDay: (dayNumber: number) => void
  completeExercise: (slug: string) => void
  saveExerciseRecord: (slug: string, sets: number, reps: string, weight: number) => void
  logWeight: (weight: number) => void
  addSessionDuration: (dayNumber: number, minutes: number) => void
  resetProgress: () => void
}

const initialProgress: UserProgress = {
  planSlug: 'gluteos-de-acero',
  currentWeek: 1,
  completedDays: [],
  exerciseRecords: {},
  weightHistory: [
    { date: '2024-01-01', weight: 68 },
    { date: '2024-01-08', weight: 67.5 },
    { date: '2024-01-15', weight: 67 },
    { date: '2024-01-22', weight: 66.5 },
  ],
  sessionDuration: {},
}

export const useAppStore = create<AppState>((set) => ({
  lang: 'es',
  setLang: (lang) => set({ lang }),

  userName: 'María',
  userWeight: 66.5,
  currentPlanSlug: 'gluteos-de-acero',
  progress: initialProgress,
  
  completeDay: (dayNumber) => set((state) => ({
    progress: {
      ...state.progress,
      completedDays: [...state.progress.completedDays, dayNumber],
    }
  })),
  
  completeExercise: (slug) => set((state) => ({
    progress: {
      ...state.progress,
      exerciseRecords: {
        ...state.progress.exerciseRecords,
        [slug]: state.progress.exerciseRecords[slug] || { sets: 0, reps: '0', weight: 0 },
      }
    }
  })),
  
  saveExerciseRecord: (slug, sets, reps, weight) => set((state) => ({
    progress: {
      ...state.progress,
      exerciseRecords: {
        ...state.progress.exerciseRecords,
        [slug]: { sets, reps, weight },
      }
    }
  })),
  
  logWeight: (weight) => set((state) => ({
    userWeight: weight,
    progress: {
      ...state.progress,
      weightHistory: [
        ...state.progress.weightHistory,
        { date: new Date().toISOString().split('T')[0], weight }
      ]
    }
  })),
  
  addSessionDuration: (dayNumber, minutes) => set((state) => ({
    progress: {
      ...state.progress,
      sessionDuration: {
        ...state.progress.sessionDuration,
        [dayNumber]: minutes,
      }
    }
  })),
  
  resetProgress: () => set({ progress: initialProgress }),
}))
