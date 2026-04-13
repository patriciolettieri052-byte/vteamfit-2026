'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/recuperar/nueva`,
    })

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm py-12">
      <div className="flex justify-center mb-10">
        <Image src="/images/logo.svg" alt="VTeamFit" width={138} height={46} />
      </div>

      {sent ? (
        <div className="text-center">
          <div className="text-5xl mb-6">📧</div>
          <h1 className="text-2xl font-black text-white italic uppercase mb-3">
            Revisá tu email
          </h1>
          <p className="text-dim text-sm mb-8">
            Te enviamos un link para recuperar tu contraseña
          </p>
          <Link
            href="/login"
            className="text-copper font-bold text-sm hover:underline"
          >
            Volver al login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
            Recuperar contraseña
          </h1>
          <p className="text-dim text-sm mb-8">
            Te enviamos un link a tu email para resetear tu contraseña
          </p>

          <form onSubmit={handleRecuperar} className="flex flex-col gap-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper text-white font-black uppercase tracking-widest py-4 rounded-2xl mt-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-dim text-sm hover:text-copper transition-colors">
              Volver al login
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
