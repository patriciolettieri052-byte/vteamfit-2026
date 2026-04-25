import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Verificar sesión activa
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json()
  const { objetivo, dias_por_semana, acceso_gimnasio, limitaciones } = body

  if (!objetivo || !dias_por_semana || !acceso_gimnasio) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  // Upsert — cada usuario solo tiene una fila (UNIQUE por user_id)
  const { error } = await supabase
    .from('user_custom_onboarding')
    .upsert(
      {
        user_id: user.id,
        objetivo,
        dias_por_semana: Number(dias_por_semana),
        acceso_gimnasio,
        limitaciones: limitaciones || null,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Error saving custom onboarding:', error.message)
    return NextResponse.json({ error: 'Error al guardar las respuestas' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
