import { create } from 'zustand'
import { UserProgress } from '@/types'

interface AppState {
  // Configuración global
  lang: 'es' | 'en' | 'pt' | 'it' | 'ru'
  setLang: (lang: 'es' | 'en' | 'pt' | 'it' | 'ru') => void

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
  clearSession: () => void
  hydrateProgress: (completedDays: number[], exerciseRecords: Record<string, { sets: number; reps: string; weight: number }>, weightHistory: { date: string; weight: number }[]) => void
  completeDay: (dayNumber: number) => void
  completeExercise: (slug: string) => void
  saveExerciseRecord: (slug: string, sets: number, reps: string, weight: number) => void
  logWeight: (weight: number) => void
  addSessionDuration: (dayNumber: number, minutes: number) => void
  resetProgress: () => void
}

const initialProgress: UserProgress = {
  planSlug: '',
  currentWeek: 1,
  completedDays: [],
  exerciseRecords: {},
  weightHistory: [],
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
  clearSession: () => set({
    userId: null,
    userName: 'Invitado',
    isTester: false,
    currentPlanId: null,
    currentPlanSlug: '',
    currentPlanName: '',
    startedAt: null,
    progress: initialProgress,
  }),

  // Hidrata el store con datos reales de Supabase (llamado al cargar el dashboard)
  hydrateProgress: (completedDays, exerciseRecords, weightHistory) => set((state) => ({
    progress: {
      ...state.progress,
      completedDays,
      exerciseRecords,
      weightHistory,
    }
  })),

  // Previene duplicados con Set
  completeDay: (dayNumber) => set((state) => ({
    progress: {
      ...state.progress,
      completedDays: [...new Set([...state.progress.completedDays, dayNumber])],
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

