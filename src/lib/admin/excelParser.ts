import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'

export interface CustomPlanRow {
  week_number: number
  day_number: number
  exercise_slug: string
  sets: number
  reps: string
  rest_seconds: number
  order_index: number
  notes?: string
}

export interface ParseResult {
  rows: CustomPlanRow[]
  errors: string[]
}

/**
 * Parsea un Excel con el formato predefinido de Vicky Torres.
 * Columnas (A-G): semana, dia, ejercicio, series, repeticiones, descanso_seg, notas
 * Valida cada exercise_slug contra la tabla `exercises` antes de devolver.
 */
export async function parseCustomPlanExcel(
  buffer: ArrayBuffer
): Promise<ParseResult> {
  const supabase = await createClient()

  // Obtener slugs válidos de exercises
  const { data: exercises, error: exErr } = await supabase
    .from('exercises')
    .select('slug')

  if (exErr) {
    return { rows: [], errors: ['No se pudo conectar con la base de datos para validar ejercicios.'] }
  }

  const validSlugs = new Set(exercises?.map(e => e.slug) ?? [])

  // Leer Excel
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  const errors: string[] = []
  const validRows: CustomPlanRow[] = []
  let orderIndex = 0

  for (const [i, row] of rawRows.entries()) {
    const lineNum = i + 2 // fila 1 = encabezado

    const slug = String(row['ejercicio'] ?? '').trim().toLowerCase()

    // Ignorar filas vacías o de descanso
    if (!slug || slug === 'descanso') continue

    const weekNum = Number(row['semana'])
    const dayNum = Number(row['dia'])

    if (!weekNum || !dayNum || isNaN(weekNum) || isNaN(dayNum)) {
      errors.push(`Fila ${lineNum}: semana y día deben ser números válidos (semana=${row['semana']}, dia=${row['dia']})`)
      continue
    }

    // Validar slug
    if (!validSlugs.has(slug)) {
      errors.push(`Fila ${lineNum}: el ejercicio "${slug}" no existe en la base de datos`)
      continue
    }

    validRows.push({
      week_number: weekNum,
      day_number: dayNum,
      exercise_slug: slug,
      sets: Number(row['series']) || 3,
      reps: String(row['repeticiones'] ?? '12'),
      rest_seconds: Number(row['descanso_seg']) || 60,
      order_index: orderIndex++,
      notes: row['notas'] ? String(row['notas']) : undefined,
    })
  }

  return { rows: validRows, errors }
}
