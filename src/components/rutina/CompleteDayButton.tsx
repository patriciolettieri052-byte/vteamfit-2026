'use client'

import { useAppStore } from '@/store/appStore'
import { useRouter } from 'next/navigation'

export default function CompleteDayButton({ dayNumber, allCompleted, weekNumber }: { dayNumber: number, allCompleted: boolean, weekNumber: number }) {
  const { completeDay, lang } = useAppStore()
  const router = useRouter()

  // Guard clause: Invisible until requirements are met.
  if (!allCompleted) return null

  const handleComplete = () => {
    // Redirection to the success celebration page
    router.push(`/dashboard/semana/${weekNumber}/dia/${dayNumber}/exito`)
  }

  return (
    <div className="fixed bottom-[88px] left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-40 md:static md:bg-transparent md:border-none md:p-8 md:flex md:justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={handleComplete}
        className="w-full md:w-auto md:min-w-[400px] flex items-center justify-center bg-emerald-500 text-white font-black text-xl md:text-2xl uppercase tracking-widest py-5 px-10 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all hover:-translate-y-2 active:scale-95 duration-300 gap-3"
      >
        <span>{lang === 'es' ? 'Completar Día' : 'Complete Day'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </button>
    </div>
  )
}
