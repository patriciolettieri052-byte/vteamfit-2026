import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

function isAdminAuthed(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore.get('admin_auth')?.value === 'valid'
}

export async function GET() {
  const cookieStore = await cookies()

  if (!isAdminAuthed(cookieStore)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = await createClient()

  // 1. Obtener el ID del plan 'entrena-conmigo'
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('slug', 'entrena-conmigo')
    .maybeSingle()

  if (!plan) {
    return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
  }

  // 2. Obtener usuarios con plan activo
  const { data: userPlans, error: upError } = await supabase
    .from('user_plans')
    .select('user_id, started_at')
    .eq('plan_id', plan.id)
    .eq('status', 'active')

  if (upError) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }

  if (!userPlans || userPlans.length === 0) {
    return NextResponse.json([])
  }

  const userIds = userPlans.map(up => up.user_id)

  // 3. Obtener perfiles de usuarios
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, name')
    .in('id', userIds)

  // 4. Obtener emails de auth (usando service role implícito via server client)
  // Nota: esto requiere que el server client tenga permisos para auth.users o una vista
  // Por seguridad, usamos user_profiles como fuente de verdad
  // Si hay campo email en user_profiles, se usa; si no, se omite

  // 5. Obtener respuestas de onboarding
  const { data: onboardings } = await supabase
    .from('user_custom_onboarding')
    .select('*')
    .in('user_id', userIds)

  // 6. Obtener count de plan days por usuario
  const { data: planDayCounts } = await supabase
    .from('user_custom_plan_days')
    .select('user_id')
    .in('user_id', userIds)

  // Armar mapa de counts
  const countMap: Record<string, number> = {}
  planDayCounts?.forEach(row => {
    countMap[row.user_id] = (countMap[row.user_id] || 0) + 1
  })

  // Armar respuesta
  const result = userPlans.map(up => {
    const profile = profiles?.find(p => p.id === up.user_id)
    const onboarding = onboardings?.find(o => o.user_id === up.user_id)
    const dayCount = countMap[up.user_id] || 0

    return {
      user_id: up.user_id,
      name: profile?.name || 'Usuario',
      started_at: up.started_at,
      onboarding: onboarding || null,
      hasPlan: dayCount > 0,
      planDayCount: dayCount,
    }
  })

  // Ordenar: sin plan primero (⏳), luego con plan (✅)
  result.sort((a, b) => Number(a.hasPlan) - Number(b.hasPlan))

  return NextResponse.json(result)
}
