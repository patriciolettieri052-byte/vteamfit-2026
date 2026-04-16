import { create } from 'zustand'
import { UserProgress } from '@/types'

interface AppState {
  // Configuración global
  lang: 'es' | 'en'
  setLang: (lang: 'es' | 'en') => void

  // Usuario Real (Supabase)
  userId: string | null
  userName: string
  isTester: boolean
  
  // Plan Activo
  currentPlanId: string | null
  currentPlanSlug: string
  currentPlanName: string
  startedAt: string | null
  
  // Progreso del plan activo
  progress: UserProgress
  
  // Acciones
  setSession: (userId: string, name: string, isTester: boolean) => void
  setActivePlan: (planId: string, slug: string, name: string, startedAt: string) => void
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

  userId: null,
  userName: 'Invitado',
  isTester: false,
  currentPlanId: null,
  currentPlanSlug: '',
  currentPlanName: '',
  startedAt: null,
  progress: initialProgress,
  
  setSession: (userId, name, isTester) => set({ userId, userName: name, isTester }),
  setActivePlan: (planId, slug, name, startedAt) => set({ 
    currentPlanId: planId, 
    currentPlanSlug: slug, 
    currentPlanName: name,
    startedAt 
  }),

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
