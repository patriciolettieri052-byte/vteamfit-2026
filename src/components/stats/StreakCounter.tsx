'use client'

import { useAppStore } from '@/store/appStore'

export default function StreakCounter({ lang }: { lang: string }) {
  const { progress } = useAppStore()
  
  // Logical Streak calculation from completedDays (sorted consecutive numbers)
  const calculateStreak = () => {
    if (progress.completedDays.length === 0) return 0
    
    // Sort to handle potential non-sequential entries
    const sortedDays = [...progress.completedDays].sort((a, b) => a - b)
    
    let currentStreak = 0
    let lastDay = -1
    
    // In a demo, we assume the streak is "total consecutive days completed so far"
    // For real world, we would compare with the current date's day number
    for(let i = sortedDays.length - 1; i >= 0; i--) {
        if (lastDay === -1 || sortedDays[i] === lastDay - 1) {
            currentStreak++
            lastDay = sortedDays[i]
        } else {
            break // Broken streak
        }
    }
    return currentStreak
  }

  const streak = calculateStreak()

  return (
    <div className="w-full bg-surface p-6 rounded-[2rem] border border-white/5 shadow-xl flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(249,115,22,0.2)]">
          ðŸ”¥
        </div>
        <div>
          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1 block">
            {lang === 'es' ? 'Racha Actual' : 'Current Streak'}
          </span>
          <h3 className="text-3xl font-black text-white italic uppercase leading-none">
            {streak} {lang === 'es' ? 'DÃ­as' : 'Days'}
          </h3>
        </div>
      </div>
      
      <div className="text-right">
        <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">
            {lang === 'es' ? 'Â¡Vas con todo!' : 'On fire!'}
        </span>
      </div>
    </div>
  )
}
