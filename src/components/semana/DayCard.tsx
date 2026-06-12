import Link from 'next/link'
import { Day } from '@/types'
import { INTENSITY_COLORS } from '@/lib/constants'

export default function DayCard({ day, isCompleted, lang, weekNumber }: { day: Day, isCompleted: boolean, lang: string, weekNumber: number }) {
  
  // Fetch tailwind pre-mapped classes from constants
  const intensityStyle = day.intensity ? INTENSITY_COLORS[day.intensity] : ''
  
  // Format day name. e.g "Semana 1 Â· Lunes" -> "Lunes"
  const titleDisplay = lang === 'en' 
    ? `Day ${day.day_number}` 
    : (day.title.includes('Â·') ? day.title.split('Â·')[1].trim() : day.title)

  return (
    <Link 
      href={`/dashboard/semana/${weekNumber}/dia/${day.day_number}`}
      className={`relative w-full min-w-0 flex items-center bg-surface p-6 rounded-3xl border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:scale-[1.02] active:scale-95 ${isCompleted ? 'opacity-80' : ''}`}
    >
      <div className="flex flex-col flex-1 min-w-0 pr-4 gap-2.5">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{titleDisplay}</h3>
        <p className="text-zinc-500 font-medium text-sm leading-snug">
          {day.recommended}
        </p>
      </div>

      {/* Badge or Rest Icon */}
      <div className="shrink-0 flex items-center justify-end">
        {day.is_rest_day ? (
          <div className="w-12 h-12 flex items-center justify-center text-copper" title={lang === 'es' ? 'Descanso' : 'Rest'}>
            <svg 
              className="w-10 h-10 animate-[spin_3s_linear_infinite]" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
                className="opacity-20" 
              />
              <path 
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                className="drop-shadow-[0_0_8px_rgba(137,116,73,0.8)]"
              />
              <circle cx="12" cy="2" r="2" fill="currentColor" />
            </svg>
          </div>
        ) : (
          <div className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase ${intensityStyle}`}>
            {lang === 'en' ? day.intensity?.replace('FUERTE', 'HARD').replace('MEDIO', 'MODERATE').replace('SUAVE', 'LIGHT') : day.intensity}
          </div>
        )}
      </div>

      {/* Checkmark overlay for completed status */}
      {isCompleted && (
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-emerald-500 border-4 border-carbon flex items-center justify-center text-white shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}
    </Link>
  )
}
