'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getActivePlan } from '@/lib/supabase/queries'
import { useAppStore } from '@/store/appStore'
import WeekList from '@/components/dashboard/WeekList'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { lang, userName, currentPlanName, setSession, setActivePlan } = useAppStore()
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const activePlan = await getActivePlan(user.id)
        
        if (!activePlan) {
          router.push('/planes')
          return
        }

        // Update Store
        setSession(user.id, activePlan.user_name, activePlan.is_tester)
        setActivePlan(
          activePlan.plan_id, 
          activePlan.slug, 
          activePlan.name, 
          activePlan.started_at
        )
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase, router, setSession, setActivePlan])

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
      
      {/* Plan Card Spotlight */}
      <section className="bg-copper/10 rounded-[2rem] p-8 border border-copper/30 relative overflow-hidden mb-10 shadow-[0_0_40px_rgba(255,107,74,0.05)]">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-copper/30 blur-[50px] rounded-full" />
        <h2 className="text-copper font-black tracking-widest uppercase text-xs mb-3 relative z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
          {lang === 'es' ? 'Plan Activo' : 'Active Plan'}
        </h2>
        <h3 className="text-3xl md:text-4xl font-black text-white italic uppercase leading-[1.1] relative z-10 text-balance">
          {currentPlanName}
        </h3>
      </section>

      <WeekList />
    </main>
  )
}
