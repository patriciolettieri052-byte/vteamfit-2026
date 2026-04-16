/**
 * Lógica de semanas desbloqueadas:
 * is_tester = true → todas desbloqueadas
 * is_tester = false → solo semanas donde:
 *   started_at + (week_number - 1) * 7 días <= hoy
 */
export const isWeekUnlocked = (weekNumber: number, startedAt: string | null, isTester: boolean) => {
  if (isTester) return true
  if (!startedAt) return weekNumber === 1 // Fallback safe
  
  const start = new Date(startedAt)
  const unlockDate = new Date(start)
  unlockDate.setDate(unlockDate.getDate() + (weekNumber - 1) * 7)
  
  return new Date() >= unlockDate
}

/**
 * getCurrentWeek: La más alta desbloqueada
 */
export const getCurrentWeek = (weeks: any[], startedAt: string | null, isTester: boolean) => {
  if (isTester) return Math.max(...weeks.map(w => w.week_number))
  
  let current = 1
  weeks.forEach(w => {
    if (isWeekUnlocked(w.week_number, startedAt, isTester)) {
      current = Math.max(current, w.week_number)
    }
  })
  return current
}
