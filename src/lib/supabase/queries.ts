import { createClient } from './client'

export async function getActivePlan(userId: string) {
  const supabase = createClient()
  
  // joining user_plans with plans and user_profiles to get is_tester
  const { data, error } = await supabase
    .from('user_plans')
    .select(`
      plan_id,
      started_at,
      expires_at,
      status,
      plans (
        slug,
        name_es,
        name_en
      ),
      user_profiles:user_id (
        is_tester,
        name
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  // Flatten the response to match the contract
  const profile = Array.isArray(data.user_profiles) ? data.user_profiles[0] : data.user_profiles;
  const plan = Array.isArray(data.plans) ? data.plans[0] : data.plans;

  return {
    plan_id: data.plan_id,
    slug: plan?.slug,
    name: plan?.name_es, // default to ES
    status: data.status,
    started_at: data.started_at,
    expires_at: data.expires_at,
    is_tester: (profile as any)?.is_tester || false,
    user_name: (profile as any)?.name || 'Usuario'
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
