'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useRouter } from 'next/navigation'

interface ExerciseFormProps {
  slug: string
  defaultSets: number
  defaultReps: string
  week: number
  day: number
  lang: 'es' | 'en'
}

export default function ExerciseForm({ slug, defaultSets, defaultReps, week, day, lang }: ExerciseFormProps) {
  const { saveExerciseRecord } = useAppStore()
  const router = useRouter()
  
  const [sets, setSets] = useState(defaultSets)
  const [reps, setReps] = useState(defaultReps)
  const [weight, setWeight] = useState(0)

  const handleSave = () => {
    saveExerciseRecord(slug, sets, reps, weight)
    router.push(`/dashboard/semana/${week}/dia/${day}`)
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-32">
      <div className="bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col gap-6">
        <h2 className="text-xl font-black text-white italic uppercase tracking-tight">
          {lang === 'es' ? 'Registra tu Serie' : 'Log your Set'}
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              {lang === 'es' ? 'Series' : 'Sets'}
            </label>
            <input 
              type="number" 
              value={sets}
              onChange={(e) => setSets(parseInt(e.target.value) || 0)}
              className="w-full bg-carbon border border-white/10 rounded-2xl p-4 text-white font-black text-center focus:border-copper outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
              Reps
            </label>
            <input 
              type="text" 
              value={reps}
              onChange={(e) => setReps(e.target.value)}
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
              onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
              className="w-full bg-carbon border border-white/10 rounded-2xl p-4 text-white font-black text-center focus:border-copper outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-[88px] left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-40 md:static md:bg-transparent md:border-none md:p-0">
        <button 
          onClick={handleSave}
          className="w-full bg-copper text-white font-black text-xl uppercase tracking-widest py-6 rounded-full shadow-[0_0_32px_rgba(255,107,74,0.3)] hover:bg-[#ff8566] transition-all active:scale-95"
        >
          {lang === 'es' ? 'Guardar y Continuar' : 'Save and Continue'}
        </button>
      </div>
    </div>
  )
}
