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

  // Verificar si ya tiene ESTE plan específico activo y vigente
  const { data: thisSpecificPlan } = await supabase
    .from('user_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('plan_id', plan.id)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .maybeSingle()

  if (thisSpecificPlan) {
    // Ya tiene este plan → no es error, redirigir al dashboard
    return NextResponse.json({ success: true, alreadyAssigned: true })
  }

  // Verificar si tiene CUALQUIER OTRO plan activo vigente
  const { data: otherActivePlan } = await supabase
    .from('user_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gte('expires_at', new Date().toISOString())
    .neq('plan_id', plan.id)
    .maybeSingle()

  if (otherActivePlan) {
    return NextResponse.json({ error: 'Ya tenés un plan activo diferente' }, { status: 400 })
  }

  // Insertar el plan
  const { error: insertError } = await supabase
    .from('user_plans')
    .insert({
      user_id: user.id,
      plan_id: plan.id,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })

  if (insertError) {
    return NextResponse.json({ error: 'Error al asignar el plan. Contactá soporte.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, alreadyAssigned: false })
}

