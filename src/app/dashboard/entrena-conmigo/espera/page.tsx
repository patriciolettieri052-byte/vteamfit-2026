'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/appStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function EsperaPage() {
  const router = useRouter()
  const { lang } = useAppStore()
  const [checking, setChecking] = useState(true)
  const isEs = lang === 'es'

  useEffect(() => {
    async function checkPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Verificar si Vicky ya subió el plan
      const { count } = await supabase
        .from('user_custom_plan_days')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count && count > 0) {
        // Plan disponible → ir al dashboard normal
        router.push('/dashboard')
        return
      }

      setChecking(false)
    }

    checkPlan()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-carbon">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-carbon flex flex-col items-center justify-center px-6 py-12 text-center selection:bg-copper selection:text-white">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-copper/5 blur-[120px] rounded-full" />
      </div>

      {/* Foto de Vicky */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-copper/40 shadow-[0_0_40px_rgba(255,107,74,0.2)] mb-8">
        <Image
          src="/images/fotos/vicky-personalizado.jpg"
          alt="Vicky Torres"
          fill
          className="object-cover object-top"
          priority
        />
      </div>

      {/* Mensaje */}
      <div className="max-w-sm relative z-10">
        {/* Animación de pulso */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
          <span className="text-copper text-[10px] font-black tracking-[0.3em] uppercase">
            {isEs ? 'EN PREPARACIÓN' : 'IN PREPARATION'}
          </span>
          <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
        </div>

        <h1 className="text-4xl font-black text-white italic uppercase tracking-tight mb-4">
          {isEs ? '¡Gracias!' : 'Thank you!'}
        </h1>

        <p className="text-zinc-300 text-lg font-medium leading-relaxed mb-3">
          {isEs
            ? 'Tu plan está en preparación.'
            : 'Your plan is being prepared.'}
        </p>

        <p className="text-zinc-500 text-base leading-relaxed mb-10">
          {isEs
            ? 'Vicky está revisando tus respuestas y diseñando tu entrenamiento personalizado. Te contactará en las próximas 24-48hs por WhatsApp.'
            : 'Vicky is reviewing your answers and designing your personalized training. She will contact you within 24-48 hours via WhatsApp.'}
        </p>

        {/* WhatsApp button */}
        {/* TODO: Reemplazar href="#" con el número real de Vicky: https://wa.me/+598XXXXXXXX */}
        <a
          href="#"
          className="inline-flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-black uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#25D366]/20 hover:shadow-[0_0_24px_rgba(37,211,102,0.2)] transition-all hover:-translate-y-1 duration-200"
        >
          {/* WhatsApp icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {isEs ? 'Contactar a Vicky' : 'Contact Vicky'}
        </a>

        {/* Link al dashboard */}
        <div className="mt-8">
          <a
            href="/dashboard"
            className="text-zinc-600 hover:text-zinc-400 text-sm font-medium underline underline-offset-4 transition-colors"
          >
            {isEs ? 'Ir al dashboard' : 'Go to dashboard'}
          </a>
        </div>
      </div>
    </main>
  )
}
