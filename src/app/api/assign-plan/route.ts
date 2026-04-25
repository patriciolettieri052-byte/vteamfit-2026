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
  const { planSlug } = body

  if (!planSlug) {
    return NextResponse.json({ error: 'planSlug es requerido' }, { status: 400 })
  }

  // Buscar el plan por slug primero (necesitamos el ID)
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('slug', planSlug)
    .single()

  if (!plan) {
    return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
  }

  // Verificar si ya tiene CUALQUIER plan activo vigente (no importa cuál)
  const { data: anyActivePlan } = await supabase
    .from('user_plans')
    .select('id, plan_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .maybeSingle()

  if (anyActivePlan) {
    // Ya tiene un plan activo — no asignar otro
    return NextResponse.json(
      { error: 'Ya tenés un plan activo', alreadyAssigned: true },
      { status: 400 }
    )
  }

  // Insertar el plan
  const PLAN_DURATION_DAYS: Record<string, number> = {
    'transforma-tu-cuerpo': 30,
    'plan-padel': 30,
    'gluteos-de-acero': 84,
    'entrena-conmigo': 30,
    'fisico-en-pista-padel': 3650,
  }
  const durationDays = PLAN_DURATION_DAYS[planSlug] ?? 30

  const { error: insertError } = await supabase
    .from('user_plans')
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
    })

  if (insertError) {
    return NextResponse.json({ error: 'Error al asignar el plan. Contactá soporte.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, alreadyAssigned: false })
}

