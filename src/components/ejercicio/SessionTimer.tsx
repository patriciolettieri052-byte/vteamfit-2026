'use client'

import { useState, useEffect, useRef } from 'react'

export default function SessionTimer({ dayNumber, onTimeUpdate, lang }: { dayNumber: number, onTimeUpdate: (minutes: number) => void, lang: 'es' | 'en' }) {
  const [isActive, setIsActive] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive])

  const toggleTimer = () => {
    if (isActive) {
      // Stopped: report minutes
      onTimeUpdate(Math.ceil(seconds / 60))
    }
    setIsActive(!isActive)
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full bg-surface p-6 rounded-[2rem] border border-white/5 shadow-xl flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-zinc-500 font-black tracking-widest uppercase text-[10px] mb-1">
          {lang === 'es' ? 'Cronómetro de Sesión' : 'Session Timer'}
        </span>
        <span className={`text-4xl font-mono font-black italic ${isActive ? 'text-copper animate-pulse' : 'text-white'}`}>
          {formatTime(seconds)}
        </span>
      </div>
      
      <button
        onClick={toggleTimer}
        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
          isActive 
            ? 'bg-zinc-800 text-white border border-white/10' 
            : 'bg-copper text-white shadow-[0_0_20px_rgba(255,107,74,0.3)]'
        }`}
      >
        {isActive 
          ? (lang === 'es' ? 'Pausar' : 'Pause') 
          : (lang === 'es' ? 'Iniciar Ejercicio' : 'Start Exercise')}
      </button>
    </div>
  )
}
