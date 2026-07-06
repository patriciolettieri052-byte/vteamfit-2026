'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getActivePlan, getAllActivePlans, loadUserProgress, loadExerciseRecords, loadWeightHistory } from '@/lib/supabase/queries'
import { useAppStore } from '@/store/appStore'
import WeekList from '@/components/dashboard/WeekList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const supabase = createClient()

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [isHydrating, setIsHydrating] = useState(false)
  const { lang, userName, currentPlanId, currentPlanName, isTester, setSession, setActivePlan, hydrateProgress, clearSession } = useAppStore()

  // Reusable function to fetch and hydrate progress for a specific plan
  const hydratePlanData = async (userId: string, planSlug: string) => {
    const [progressData, exerciseData, weightData] = await Promise.all([
      loadUserProgress(userId, planSlug),
      loadExerciseRecords(userId),
      loadWeightHistory(userId),
    ])

    const completedDays = progressData.map(p => p.day_number)
    const exerciseRecords: Record<string, { sets: number; reps: string; weight: number }> = {}
    exerciseData.forEach(r => {
      exerciseRecords[r.exercise_slug] = {
        sets: r.sets,
        reps: String(r.reps),
        weight: r.weight,
      }
    })
    const weightHistory = weightData.map(w => ({
      date: w.recorded_at.split('T')[0],
      weight: w.weight,
    }))

    hydrateProgress(completedDays, exerciseRecords, weightHistory)
  }

  const handlePlanSwitch = async (planId: string) => {
    const plan = availablePlans.find(p => p.plan_id === planId)
    if (!plan || isHydrating) return
    
    setIsHydrating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setActivePlan(
        plan.plan_id, 
        plan.slug, 
        plan.name, 
        plan.started_at
      )

      await hydratePlanData(user.id, plan.slug)
    } catch (error) {
      console.error('Error switching plan:', error)
    } finally {
      setIsHydrating(false)
    }
  }

  useEffect(() => {
    async function loadDashboardData() {
      clearSession()
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const activePlan = await getActivePlan(user.id)
        
        if (!activePlan) {
          // Si no hay plan activo, terminamos la carga para mostrar el banner
          setLoading(false)
          return
        }

        // Update Store session
        setSession(user.id, activePlan.user_name, activePlan.is_tester)
        
        // If tester, load all available active plans
        if (activePlan.is_tester) {
          const plans = await getAllActivePlans(user.id)
          setAvailablePlans(plans)
        }

        setActivePlan(
          activePlan.plan_id, 
          activePlan.slug, 
          activePlan.name, 
          activePlan.started_at
        )

        // Si el plan activo es 'entrena-conmigo', verificar si Vicky ya subió el plan
        if (activePlan.slug === 'entrena-conmigo') {
          const { count } = await supabase
            .from('user_custom_plan_days')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (!count || count === 0) {
            // Vicky todavía no subió el plan → pantalla de espera
            router.push('/dashboard/entrena-conmigo/espera')
            return
          }
          // Si hay datos → continuar con hidratación normal (TICKET-CUSTOM-03)
        }

        // Initial hydration
        await hydratePlanData(user.id, activePlan.slug)
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [router, setSession, setActivePlan, clearSession])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full px-6 pt-12 pb-6">
      {/* Header Profile */}
      <header className="flex items-center gap-5 mb-10">
        <div className="w-16 h-16 bg-surface rounded-full border border-white/10 flex items-center justify-center font-black text-2xl text-copper shadow-lg uppercase">
          {userName.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {lang === 'es' ? `Hola, ${userName}` : `Hello, ${userName}`}
          </h1>
          <p className="text-zinc-400 font-medium text-sm tracking-wide mt-1">
            {lang === 'es' ? 'Lista para entrenar' : 'Ready to train'}
          </p>
        </div>
      </header>
      
      {/* Promotional Banner for Users without Active Plan */}
      {!isTester && !currentPlanId && (
        <div className="mb-6 p-4 rounded-2xl border border-copper/30 bg-copper/5 flex items-center justify-between shadow-[0_0_24px_rgba(255,107,74,0.05)]">
          <span className="text-dim text-sm font-medium">
            {lang === 'es' ? '¿Quieres empezar a entrenar?' : 'Want to start training?'}
          </span>
          <Link 
            href="/#planes" 
            className="text-copper text-sm font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            {lang === 'es' ? 'Ver planes →' : 'See plans →'}
          </Link>
        </div>
      )}

      {/* Plan Card Spotlight */}
      <section className="bg-copper/10 rounded-[2rem] p-8 border border-copper/30 relative overflow-hidden mb-10 shadow-[0_0_40px_rgba(255,107,74,0.05)]">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-copper/30 blur-[50px] rounded-full" />
        <h2 className="text-copper font-black tracking-widest uppercase text-xs mb-3 relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
          {lang === 'es' ? 'Plan Activo' : 'Active Plan'}
        </h2>
        
        {isTester && availablePlans.length > 1 ? (
          <div className="relative z-10 w-full">
            <select 
              value={currentPlanId || ''}
              onChange={(e) => handlePlanSwitch(e.target.value)}
              disabled={isHydrating}
              className="w-full bg-carbon/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xl md:text-2xl font-black italic uppercase leading-none appearance-none focus:outline-none focus:border-copper transition-colors cursor-pointer disabled:opacity-50"
            >
              {availablePlans.map(plan => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-copper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        ) : (
          <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase leading-[1.1] relative z-10 text-balance">
            {currentPlanName}
          </h3>
        )}
      </section>

      <WeekList />
    </main>
  )
}
