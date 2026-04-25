'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/appStore'
import CustomOnboarding from '@/components/plan/CustomOnboarding'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EntrenaComigoOnboardingPage() {
  const router = useRouter()
  const { lang } = useAppStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkOnboarding() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Si ya completó el onboarding → ir a espera directamente
      const { data: existing } = await supabase
        .from('user_custom_onboarding')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        router.push('/dashboard/entrena-conmigo/espera')
        return
      }

      setChecking(false)
    }

    checkOnboarding()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <LoadingSpinner />
      </div>
    )
  }

  return <CustomOnboarding lang={lang} />
}
