import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { parseCustomPlanExcel } from '@/lib/admin/excelParser'

function isAdminAuthed(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore.get('admin_auth')?.value === 'valid'
}

export async function POST(request: Request) {
  const cookieStore = await cookies()

  if (!isAdminAuthed(cookieStore)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Parsear FormData
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Error al procesar el formulario' }, { status: 400 })
  }

  const userId = formData.get('userId') as string
  const file = formData.get('file') as File | null

  if (!userId || !file) {
    return NextResponse.json({ error: 'userId y archivo son requeridos' }, { status: 400 })
  }

  if (!file.name.endsWith('.xlsx')) {
    return NextResponse.json({ error: 'El archivo debe ser .xlsx' }, { status: 400 })
  }

  // Leer el buffer del archivo
  const buffer = await file.arrayBuffer()

  // Parsear y validar
  const { rows, errors } = await parseCustomPlanExcel(buffer)

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'El Excel tiene errores. Corregí los siguientes problemas y volvé a subir:', errors },
      { status: 400 }
    )
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'El Excel no contiene ejercicios válidos' }, { status: 400 })
  }

  const supabase = await createClient()

  // Borrar plan anterior del usuario
  const { error: deleteError } = await supabase
    .from('user_custom_plan_days')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Error deleting previous plan:', deleteError.message)
    return NextResponse.json({ error: 'Error al reemplazar el plan anterior' }, { status: 500 })
  }

  // Insertar todas las filas nuevas
  const rowsToInsert = rows.map(row => ({
    user_id: userId,
    week_number: row.week_number,
    day_number: row.day_number,
    exercise_slug: row.exercise_slug,
    sets: row.sets,
    reps: row.reps,
    rest_seconds: row.rest_seconds,
    order_index: row.order_index,
    notes: row.notes ?? null,
  }))

  const { error: insertError } = await supabase
    .from('user_custom_plan_days')
    .insert(rowsToInsert)

  if (insertError) {
    console.error('Error inserting plan:', insertError.message)
    return NextResponse.json({ error: 'Error al cargar el plan' }, { status: 500 })
  }

  const weekCount = new Set(rows.map(r => r.week_number)).size

  return NextResponse.json({
    success: true,
    summary: `Plan cargado: ${rows.length} ejercicios en ${weekCount} semana${weekCount !== 1 ? 's' : ''}`,
  })
}
