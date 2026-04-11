export function isTrenInferiorDay(dia: number): boolean {
  const pos = (dia - 1) % 7
  return pos === 0 || pos === 2 || pos === 4
}

export function getGrupoMuscular(
  slug: string,
  dia: number,
  exercises: Record<string, { categoria?: string }>,
  lang: 'es' | 'en' = 'es'
): string {
  if (isTrenInferiorDay(dia)) return 'TREN INFERIOR'
  const def = lang === 'es' ? 'Otros' : 'Others'
  return (exercises[slug]?.categoria ?? def).toUpperCase()
}

export function getEjercicioLabel(
  slug: string,
  dia: number,
  exercises: Record<string, { name_es?: string; categoria?: string }>
): string {
  const grupo = getGrupoMuscular(slug, dia, exercises)
  const nombre = exercises[slug]?.name_es ?? slug
  return `${grupo} - ${nombre}`
}

export function agruparEjercicios(
  slugs: string[],
  dia: number,
  exercises: Record<string, { categoria?: string }>,
  lang: 'es' | 'en' = 'es'
): Record<string, string[]> {
  if (isTrenInferiorDay(dia)) {
    return { 'TREN INFERIOR': slugs }
  }
  const sections: Record<string, string[]> = {}
  for (const slug of slugs) {
    const def = lang === 'es' ? 'Otros' : 'Others'
    const cat = (exercises[slug]?.categoria ?? def).toUpperCase()
    if (!sections[cat]) sections[cat] = []
    sections[cat].push(slug)
  }
  return sections
}
