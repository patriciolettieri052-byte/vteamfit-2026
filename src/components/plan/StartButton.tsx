'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DiscountData } from '@/components/plan/DiscountCode'

export default function StartButton({ lang, planSlug, discountData = null }: { lang: 'es' | 'en', planSlug: string, discountData?: DiscountData | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  // null = cargando, false = sin sesión, true = con sesión
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  // null = cargando, false = no tiene este plan, true = ya lo tiene activo
  const [hasPlan, setHasPlan] = useState<boolean | null>(null)

  // Verificar sesión y plan al montar el componente
  useEffect(() => {
    async function checkSessionAndPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setHasSession(false)
        setHasPlan(false)
        return
      }

      setHasSession(true)

      // Paso 1: resolver el plan_id a partir del slug
      const { data: planData } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', planSlug)
        .single()

      if (!planData) {
        setHasPlan(false)
        return
      }

      // Paso 2: verificar si el usuario ya tiene este plan activo y vigente
      const { data: userPlan } = await supabase
        .from('user_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('plan_id', planData.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .maybeSingle()

      setHasPlan(!!userPlan)
    }

    checkSessionAndPlan()
  }, [planSlug])

  async function handleComenzar() {
    if (isProcessing) return  // bloquear doble click
    setIsProcessing(true)
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (discountData?.type === 'free') {
          // Código FREE → bypasseo, directo a assign-plan
          const res = await fetch('/api/assign-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planSlug }),
          })

          if (res.ok) {
            // Plan gratis asignado -> subir count
            await fetch('/api/apply-discount', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ discountId: discountData.discountId }),
            })
            router.push('/dashboard')
            router.refresh()
          } else {
            const body = await res.json()
            if (res.status === 400 && body.alreadyAssigned) {
              router.push('/dashboard')
              router.refresh()
            } else {
              setError(body.error ?? 'No se pudo asignar el plan gratuito')
            }
          }
        } else {
          // Usuario ya logueado → asignar plan directo vía API (Hoy directo, futuro paypal)
          const res = await fetch('/api/assign-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planSlug }),
          })

          if (res.ok) {
            router.push('/dashboard')
            router.refresh()
          } else {
            const body = await res.json()
            // Si ya tiene plan activo (alreadyAssigned), mandarlo al dashboard igual
            if (res.status === 400 && body.alreadyAssigned) {
              router.push('/dashboard')
              router.refresh()
            } else {
              setError(body.error ?? 'No se pudo asignar el plan')
            }
          }
        }
      } else {
        // No logueado → flujo de registro normal
        router.push(`/registro?plan=${planSlug}`)
      }
    } finally {
      setIsProcessing(false)
      setLoading(false)
    }
  }

  // Derivar el label según el estado de sesión y plan
  const getLabel = () => {
    if (isProcessing) return lang === 'es' ? 'Procesando...' : 'Processing...'
    if (loading) return lang === 'es' ? 'Cargando...' : 'Loading...'
    // Mientras carga el estado inicial, mostrar label neutro
    if (hasSession === null) return lang === 'es' ? 'Comprar Plan' : 'Buy Plan'
    // Tiene sesión Y ya tiene este plan asignado
    if (hasSession && hasPlan) return lang === 'es' ? 'Continuar' : 'Continue'
    // Cualquier otro caso (sin sesión, o sesión sin este plan)
    return lang === 'es' ? 'Comprar Plan' : 'Buy Plan'
  }

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-50 md:static md:bg-transparent md:border-none md:p-8 flex flex-col items-center gap-2">
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
      <button
        onClick={handleComenzar}
        disabled={isProcessing || loading}
        className="w-max bg-copper text-white font-black text-lg uppercase tracking-widest py-4 px-8 rounded-full shadow-[0_0_32px_rgba(255,107,74,0.3)] hover:shadow-[0_0_48px_rgba(255,107,74,0.6)] hover:bg-[#ff8566] transition-all hover:-translate-y-2 active:scale-95 duration-300 disabled:opacity-50 flex items-center justify-center"
      >
        {getLabel()}
      </button>
    </div>
  )
}


