'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function StartButton({ lang, planSlug }: { lang: 'es' | 'en', planSlug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleComenzar() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Usuario ya logueado → asignar plan directo vía API
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
        // Si ya tiene plan activo, mandarlo al dashboard igual
        if (res.status === 400 && body.error === 'Ya tenés un plan activo') {
          router.push('/dashboard')
          router.refresh()
        } else {
          setError(body.error ?? 'No se pudo asignar el plan')
          setLoading(false)
        }
      }
    } else {
      // No logueado → flujo de registro normal
      router.push(`/registro?plan=${planSlug}`)
    }
  }

  const label = lang === 'es' ? 'Comenzar Ahora' : 'Start Now'
  const loadingLabel = lang === 'es' ? 'Cargando...' : 'Loading...'

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-50 md:static md:bg-transparent md:border-none md:p-8 flex flex-col items-center gap-2">
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
      <button
        onClick={handleComenzar}
        disabled={loading}
        className="w-max bg-copper text-white font-black text-lg uppercase tracking-widest py-4 px-8 rounded-full shadow-[0_0_32px_rgba(255,107,74,0.3)] hover:shadow-[0_0_48px_rgba(255,107,74,0.6)] hover:bg-[#ff8566] transition-all hover:-translate-y-2 active:scale-95 duration-300 disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? loadingLabel : label}
      </button>
    </div>
  )
}

