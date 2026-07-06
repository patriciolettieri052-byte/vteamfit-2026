'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function RegistroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Null cuando no hay ?plan= en la URL — el usuario elige plan después del onboarding
  const planSlug = searchParams.get('plan')

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Crear usuario en Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: nombre } }
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered') ||
          authError.message.toLowerCase().includes('already been registered') ||
          authError.code === 'user_already_exists') {
        setError('__already_registered__')
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('No se pudo crear la cuenta. Intentá de nuevo.')
      setLoading(false)
      return
    }

    // 2. Crear perfil básico
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        name: nombre,
        onboarding_complete: false,
      })

    if (profileError) {
      setError('Error al crear tu perfil. Por favor intentá de nuevo.')
      setLoading(false)
      return
    }

    // 3. Asignar plan solo si viene ?plan= en la URL
    if (planSlug) {
      const { data: planData } = await supabase
        .from('plans')
        .select('id')
        .eq('slug', planSlug)
        .single()

      if (planData) {
        const { error: planError } = await supabase
          .from('user_plans')
          .insert({
            user_id: data.user.id,
            plan_id: planData.id,
            status: 'active',
            started_at: new Date().toISOString(),
            // Beta: plan activo por 90 días
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          })

        if (planError) {
          setError('Error al asignar el plan. Contactá soporte.')
          setLoading(false)
          return
        }
      }
    }

    // 4. Redirigir siempre al onboarding
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm py-12">
      <div className="flex justify-center mb-10">
        <Image src="/images/logo.svg" alt="VTeamFit" width={166} height={55} />
      </div>

      <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
        Crear cuenta
      </h1>
      <p className="text-dim text-sm mb-8">
        Último paso para empezar tu transformación
      </p>

      <form onSubmit={handleRegistro} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-dim text-xs uppercase tracking-widest font-bold">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            placeholder="Tu nombre"
            className="bg-surface border border-dim/40 rounded-2xl px-4 py-3 text-white placeholder:text-dim/50 focus:outline-none focus:border-copper transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-dim text-xs uppercase tracking-widest font-bold">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="bg-surface border border-dim/40 rounded-2xl px-4 py-3 text-white placeholder:text-dim/50 focus:outline-none focus:border-copper transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-dim text-xs uppercase tracking-widest font-bold">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="bg-surface border border-dim/40 rounded-2xl px-4 py-3 text-white placeholder:text-dim/50 focus:outline-none focus:border-copper transition-colors"
          />
        </div>

        {error === '__already_registered__' ? (
          <p className="text-amber-400 text-sm text-center">
            Este email ya está registrado.{' '}
            <Link href="/login" className="underline font-bold hover:text-amber-300 transition-colors">
              ¿Quieres iniciar sesión?
            </Link>
          </p>
        ) : error ? (
          <p className="text-red-400 text-sm text-center">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-copper text-white font-black uppercase tracking-widest py-4 rounded-2xl mt-2 disabled:opacity-50 active:scale-95 transition-all"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-dim text-sm mt-4">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-copper underline">
          Inicia sesión
        </a>
      </p>

      <p className="text-center text-dim text-xs mt-6">
        Al registrarte aceptás nuestros términos y condiciones
      </p>
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="w-full flex justify-center py-12"><div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin"></div></div>}>
      <RegistroContent />
    </Suspense>
  )
}
