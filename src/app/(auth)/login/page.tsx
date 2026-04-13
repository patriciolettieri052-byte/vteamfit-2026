'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const expired = searchParams.get('expired')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm py-12">
      <div className="flex justify-center mb-10">
        <Image src="/images/logo.svg" alt="VTeamFit" width={120} height={40} />
      </div>

      {expired && (
        <div className="bg-surface border border-copper/30 rounded-2xl p-4 mb-6 text-center">
          <p className="text-dim text-sm">
            Tu plan ha vencido.{' '}
            <Link href="/#planes" className="text-copper font-bold">
              Ver planes disponibles
            </Link>
          </p>
        </div>
      )}

      <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
        Bienvenida
      </h1>
      <p className="text-dim text-sm mb-8">
        Iniciá sesión para continuar tu entrenamiento
      </p>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-dim text-xs uppercase tracking-widest font-bold">
            Email
          </label>
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
          <label className="text-dim text-xs uppercase tracking-widest font-bold">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="bg-surface border border-dim/40 rounded-2xl px-4 py-3 text-white placeholder:text-dim/50 focus:outline-none focus:border-copper transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-copper text-white font-black uppercase tracking-widest py-4 rounded-2xl mt-2 disabled:opacity-50 active:scale-95 transition-all"
        >
          {loading ? 'Iniciando...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="flex flex-col items-center gap-3 mt-6">
        <Link
          href="/recuperar"
          className="text-dim text-sm hover:text-copper transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Link
          href="/#planes"
          className="text-dim text-sm hover:text-white transition-colors"
        >
          Ver planes disponibles
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full flex justify-center py-12"><div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin"></div></div>}>
      <LoginContent />
    </Suspense>
  )
}
