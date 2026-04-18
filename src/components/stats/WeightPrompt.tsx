'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { persistWeight } from '@/lib/supabase/queries'

export default function WeightPrompt({ lang }: { lang: 'es' | 'en' }) {
  const { progress, logWeight, userId } = useAppStore()
  const [show, setShow] = useState(false)
  const [newWeight, setNewWeight] = useState(0)

  useEffect(() => {
    if (progress.weightHistory.length === 0) {
      setShow(true)
      return
    }

    const lastLog = progress.weightHistory[progress.weightHistory.length - 1]
    const lastDate = new Date(lastLog.date)
    const diffTime = Math.abs(new Date().getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays >= 7) {
      setShow(true)
      setNewWeight(lastLog.weight) // Start with last weight
    }
  }, [progress.weightHistory])

  if (!show) return null

  const handleLog = () => {
    if (newWeight > 0) {
      // 1. Zustand inmediato
      logWeight(newWeight)
      // 2. Supabase background
      if (userId) {
        persistWeight(userId, newWeight).catch(err =>
          console.error('Failed to persist weight:', err)
        )
      }
      setShow(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-surface p-10 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center gap-8 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-copper/20 blur-3xl rounded-full" />
        
        <div className="w-20 h-20 bg-copper/10 rounded-3xl flex items-center justify-center text-4xl shadow-xl ring-1 ring-copper/50">
          ⚖️
        </div>

        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">
            {lang === 'es' ? 'Actualiza tu Peso' : 'Weight Check-in'}
          </h2>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            {lang === 'es' 
              ? 'Ha pasado una semana. Mantener el registro te ayuda a ver tu evolución.' 
              : "It's been a week. Keep logging to track your incredible progress."}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full">
            <button 
                onClick={() => setNewWeight(w => Math.max(0, w - 0.1))}
                className="w-12 h-12 rounded-full bg-carbon border border-white/10 text-white font-black text-xl hover:bg-zinc-800 transition-colors"
            >
                -
            </button>
            <div className="flex-1 bg-carbon border border-white/10 rounded-2xl p-4 flex items-center justify-center gap-2">
                <span className="text-3xl font-black text-white italic">{newWeight.toFixed(1)}</span>
                <span className="text-zinc-500 font-bold uppercase text-xs">kg</span>
            </div>
            <button 
                onClick={() => setNewWeight(w => w + 0.1)}
                className="w-12 h-12 rounded-full bg-carbon border border-white/10 text-white font-black text-xl hover:bg-zinc-800 transition-colors"
            >
                +
            </button>
        </div>

        <div className="flex flex-col gap-3 w-full">
            <button 
                onClick={handleLog}
                className="w-full bg-copper text-white font-black text-lg uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:bg-[#ff8566] transition-all active:scale-95"
            >
                {lang === 'es' ? 'Confirmar Peso' : 'Confirm Weight'}
            </button>
            <button 
                onClick={() => setShow(false)}
                className="text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors py-2"
            >
                {lang === 'es' ? 'Omitir por ahora' : 'Skip for now'}
            </button>
        </div>
      </div>
    </div>
  )
}
