import { createClient } from './client'

export async function getActivePlan(userId: string) {
  const supabase = createClient()
  
  // 1. Obtener el registro del plan de usuario directamente (sin joins)
  const { data: userPlan, error: planError } = await supabase
    .from('user_plans')
    .select('plan_id, started_at, expires_at, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (planError) throw planError
  if (!userPlan) return null

  // 2. Obtener el perfil del usuario de forma independiente (Fix 3: "Invitado")
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('name, is_tester')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('Error fetching profile:', profileError.message)
  }

  // 3. Obtener los detalles del plan de forma independiente
  const { data: plan, error: planDetailsError } = await supabase
    .from('plans')
    .select('slug, name_es, name_en')
    .eq('id', userPlan.plan_id)
    .maybeSingle()

  if (planDetailsError) {
    console.error('Error fetching plan details:', planDetailsError.message)
  }

  // Flatten the response to match the contract
  return {
    plan_id: userPlan.plan_id,
    slug: plan?.slug,
    name: plan?.name_es, // default to ES
    status: userPlan.status,
    started_at: userPlan.started_at,
    expires_at: userPlan.expires_at,
    is_tester: profile?.is_tester || false,
    user_name: profile?.name || 'Usuario'
  }
}

export async function getWeeks(planId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('weeks')
    .select(`
      id,
      week_number,
      days (
        id,
        day_number,
        is_rest_day,
        title,
        recommended,
        intensity
      )
    `)
    .eq('plan_id', planId)
    .order('week_number', { ascending: true })

  if (error) throw error
  
  // Order days within each week
  return data.map(week => ({
    ...week,
    days: (week.days as any[]).sort((a, b) => a.day_number - b.day_number)
  }))
}

export async function getDayExercises(dayId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('day_exercises')
    .select(`
      position,
      exercise:exercises (
        id,
        slug,
        name_es,
        name_en,
        video_url,
        thumbnail_url
      )
    `)
    .eq('day_id', dayId)
    .order('position', { ascending: true })

  if (error) throw error
  
  // Normalize result to ensure exercise is an object not array
  return data.map(row => ({
    position: row.position,
    exercise: Array.isArray(row.exercise) ? row.exercise[0] : row.exercise
  }))
}
