'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        setError('Contraseña incorrecta')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-copper text-[10px] font-black tracking-[0.3em] uppercase block mb-3">VTEAMFIT</span>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Admin Panel</h1>
          <p className="text-zinc-500 text-sm mt-2">Solo para uso de Vicky Torres</p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface rounded-[2rem] p-8 border border-white/5 shadow-2xl flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="bg-carbon border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-copper transition-colors"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-4 bg-copper text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_24px_rgba(255,107,74,0.2)] hover:bg-[#ff8566] transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar cookie admin_auth en el cliente leyendo la respuesta de un endpoint protegido
    fetch('/api/admin/check-auth', { method: 'GET' })
      .then(res => setAuthed(res.ok))
      .catch(() => setAuthed(false))
  }, [])

  if (authed === null) {
    return (
      <div className="min-h-screen bg-carbon flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) {
    return <AdminLogin />
  }

  return <>{children}</>
}
