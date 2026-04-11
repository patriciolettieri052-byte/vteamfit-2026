export const BUNNY_CDN_BASE = 'https://vteamfitfull.b-cdn.net/'

export const INTENSITY_COLORS = {
  FUERTE: 'bg-copper text-white',
  MEDIO: 'bg-surface text-dim border border-dim',
  SUAVE: 'bg-carbon text-dim border border-dim/40',
} as const

export const EXERCISE_INTENSITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-green-500',
} as const

export const MONTH_RECOMMENDATIONS = [
  { days: [1, 28], text_es: '3 series · 12 repeticiones', text_en: '3 sets · 12 repetitions' },
  { days: [29, 56], text_es: '4 series · 12 repeticiones · Aumenta el peso', text_en: '4 sets · 12 repetitions · Increase weight' },
  { days: [57, 84], text_es: '4 series · 15 repeticiones · Aumenta el peso', text_en: '4 sets · 15 repetitions · Increase weight' },
] as const

export function getMonthRecommendation(dayNumber: number, lang: 'es' | 'en' = 'es'): string {
  for (const rec of MONTH_RECOMMENDATIONS) {
    if (dayNumber >= rec.days[0] && dayNumber <= rec.days[1]) {
      return lang === 'es' ? rec.text_es : rec.text_en
    }
  }
  return lang === 'es' ? '3 series · 12 repeticiones' : '3 sets · 12 repetitions'
}

export function getDayIntensity(dayNumber: number): 'FUERTE' | 'MEDIO' | 'SUAVE' | null {
  const intensidades = ['FUERTE', 'MEDIO', 'FUERTE', 'MEDIO', 'FUERTE', 'SUAVE', null] as const
  return intensidades[(dayNumber - 1) % 7]
}
