'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useRouter } from 'next/navigation'
import { persistExerciseRecord } from '@/lib/supabase/queries'

interface ExerciseFormProps {
  slug: string
  defaultSets: number
  defaultReps: string
  week: number
  day: number
  lang: 'es' | 'en'
}

export default function ExerciseForm({ slug, week, day, lang }: ExerciseFormProps) {
  const { progress, saveExerciseRecord, userId } = useAppStore()
  const router = useRouter()

  // Si el usuario ya guardó este ejercicio previamente, cargar sus valores guardados.
  // De lo contrario, iniciar en 0 por defecto como requiere la regla.
  const existingRecord = progress.exerciseRecords[slug]

  const [sets, setSets] = useState<number>(existingRecord ? existingRecord.sets : 0)
  const [reps, setReps] = useState<string>(existingRecord ? String(existingRecord.reps) : '0')
  const [weight, setWeight] = useState<number>(existingRecord ? existingRecord.weight : 0)
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    const parsedReps = parseInt(reps, 10)

    // Validación para evitar guardar datos erróneos en 0
    if (sets <= 0 || !reps || reps.trim() === '' || reps.trim() === '0' || isNaN(parsedReps) || parsedReps <= 0) {
      setError(
        lang === 'es'
          ? '⚠️ Por favor, ingresa las series y repeticiones realizadas antes de guardar el ejercicio.'
          : '⚠️ Please enter valid sets and reps before saving the exercise.'
      )
      return
    }

    setError(null)

    // 1. Guardar en Zustand inmediatamente (UX rápida)
    saveExerciseRecord(slug, sets, reps, weight)

    // 2. Persistir en Supabase en background (fire-and-forget)
    if (userId) {
      persistExerciseRecord(userId, slug, sets, reps, weight).catch(err =>
        console.error('Failed to persist exercise record:', err)
      )
    }

    router.push(`/dashboard/semana/${week}/dia/${day}`)
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-32">
      <div className="bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col gap-6">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tight">
          {lang === 'es' ? 'Registra tu Entrenamiento' : 'Log your Workout'}
        </h2>

        {/* Mensaje de aviso/error si intenta guardar sin modificar los ceros */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold leading-relaxed animate-pulse">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              {lang === 'es' ? 'Series' : 'Sets'}
            </label>
            <input 
              type="number" 
              value={sets}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setError(null)
                setSets(parseInt(e.target.value, 10) || 0)
              }}
              className="w-full bg-carbon border border-white/10 rounded-2xl p-4 text-white font-black text-center focus:border-copper outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Reps
            </label>
            <input 
              type="number" 
              value={reps}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setError(null)
                setReps(e.target.value)
              }}
              className="w-full bg-carbon border border-white/10 rounded-2xl p-4 text-white font-black text-center focus:border-copper outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              {lang === 'es' ? 'Peso (kg)' : 'Weight (kg)'}
            </label>
            <input 
              type="number" 
              value={weight}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                setError(null)
                setWeight(parseInt(e.target.value, 10) || 0)
              }}
              className="w-full bg-carbon border border-white/10 rounded-2xl p-4 text-white font-black text-center focus:border-copper outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-[88px] left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-40 md:static md:bg-transparent md:border-none md:p-0 flex justify-center">
        <button 
          onClick={handleSave}
          className="w-max bg-copper text-white font-black text-lg uppercase tracking-widest py-4 px-8 rounded-full shadow-[0_0_32px_rgba(255,107,74,0.3)] hover:bg-[#ff8566] transition-all active:scale-95"
        >
          {lang === 'es' ? 'Guardar y Continuar' : 'Save and Continue'}
        </button>
      </div>
    </div>
  )
}
