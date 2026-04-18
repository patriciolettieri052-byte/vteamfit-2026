'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/appStore'

interface UserProfile {
  name: string
  email: string
  weight_kg: number | null
  height_cm: number | null
  age: number | null
  gender: string | null
}

export default function PerfilPage() {
  const router = useRouter()
  const { clearSession } = useAppStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('user_profiles')
        .select('name, weight_kg, height_cm, age, gender')
        .eq('id', user.id)
        .maybeSingle()

      setProfile({
        name: data?.name || user.email?.split('@')[0] || 'Usuario',
        email: user.email || '',
        weight_kg: data?.weight_kg ?? null,
        height_cm: data?.height_cm ?? null,
        age: data?.age ?? null,
        gender: data?.gender ?? null,
      })
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleCerrarSesion = async () => {
    const confirmar = window.confirm('¿Querés cerrar sesión?')
    if (!confirmar) return

    // 1. Limpiar store primero
    clearSession()

    // 2. Cerrar sesión en Supabase
    const supabase = createClient()
    await supabase.auth.signOut()

    // 3. Redirigir a landing
    router.push('/')
  }

  const getInitial = (name: string) => name.charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen max-w-md mx-auto w-full px-6 pt-14 pb-8 flex flex-col gap-8">
      {/* Avatar + Nombre */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="w-20 h-20 rounded-full bg-copper flex items-center justify-center shadow-[0_0_32px_rgba(255,107,74,0.3)]">
          <span className="text-white font-black text-3xl italic">
            {getInitial(profile?.name || 'U')}
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
            {profile?.name}
          </h1>
          <p className="text-dim text-sm mt-1">{profile?.email}</p>
        </div>
      </div>

      {/* Datos físicos */}
      <div className="bg-surface rounded-[1.5rem] border border-white/5 p-6 flex flex-col gap-4">
        <h2 className="text-xs font-bold text-dim uppercase tracking-widest">Mis datos</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatItem label="Peso" value={profile?.weight_kg ? `${profile.weight_kg} kg` : '—'} />
          <StatItem label="Altura" value={profile?.height_cm ? `${profile.height_cm} cm` : '—'} />
          <StatItem label="Edad" value={profile?.age ? `${profile.age} años` : '—'} />
        </div>
        {profile?.gender && (
          <div className="border-t border-white/5 pt-4">
            <StatItem label="Género" value={profile.gender} />
          </div>
        )}
      </div>

      {/* Menú — solo Soporte y Políticas */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold text-dim uppercase tracking-widest px-1 mb-2">
          Cuenta y Preferencias
        </p>

        <MenuItem
          href="/soporte"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
          label="Soporte y Ayuda"
        />

        <MenuItem
          href="/politicas"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          }
          label="Políticas Legales"
        />
      </div>

      {/* Cerrar sesión */}
      <div className="mt-auto pt-2">
        <button
          id="btn-cerrar-sesion"
          onClick={handleCerrarSesion}
          className="w-full py-3 border border-dim/40 text-dim rounded-2xl text-sm uppercase tracking-widest hover:border-copper hover:text-copper transition-colors duration-300"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}

function MenuItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between bg-surface rounded-2xl px-5 py-4 border border-white/5 hover:border-copper/30 transition-colors group"
    >
      <div className="flex items-center gap-3 text-dim group-hover:text-white transition-colors">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-dim/50 group-hover:text-copper transition-colors">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </Link>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-dim uppercase tracking-widest">{label}</span>
      <span className="text-white font-bold text-base">{value}</span>
    </div>
  )
}
