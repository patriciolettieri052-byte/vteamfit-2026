'use client'

import { useEffect, useState } from 'react'
import PlanUploader from './PlanUploader'

interface AdminUser {
  user_id: string
  name: string
  started_at: string
  onboarding: {
    objetivo: string
    dias_por_semana: number
    acceso_gimnasio: string
    limitaciones?: string
  } | null
  hasPlan: boolean
  planDayCount: number
}

export default function UserList() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploaderTarget, setUploaderTarget] = useState<{ userId: string; userName: string } | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(data)
    } catch {
      setError('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  function handleSuccess(summary: string) {
    setUploaderTarget(null)
    setSuccessMsg(summary)
    // Recargar la lista para mostrar el estado actualizado
    loadUsers()
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-400 text-sm font-medium py-8">{error}</p>
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-500 text-sm font-medium">No hay usuarios con plan "Entrena Conmigo" aún.</p>
      </div>
    )
  }

  return (
    <>
      {/* Mensaje de éxito */}
      {successMsg && (
        <div className="mb-6 px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-emerald-400 text-sm font-bold">{successMsg}</p>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="flex flex-col gap-4">
        {users.map(user => (
          <div
            key={user.user_id}
            className={`rounded-2xl p-6 border transition-all duration-200 ${
              user.hasPlan
                ? 'bg-surface/50 border-white/5'
                : 'bg-surface border-copper/20 shadow-[0_0_20px_rgba(255,107,74,0.05)]'
            }`}
          >
            {/* Header usuario */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-copper/20 border border-copper/30 flex items-center justify-center font-black text-copper uppercase text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold text-base">{user.name}</p>
                  <p className="text-zinc-500 text-xs font-mono mt-0.5">{user.user_id.slice(0, 8)}...</p>
                </div>
              </div>
              {/* Badge plan */}
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0 ${
                user.hasPlan
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {user.hasPlan ? `✅ Cargado — ${user.planDayCount} ejercicios` : '⏳ Sin plan'}
              </span>
            </div>

            {/* Respuestas de onboarding */}
            {user.onboarding ? (
              <div className="grid grid-cols-2 gap-2 mb-5 bg-carbon/50 rounded-xl p-4">
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-0.5">Objetivo</p>
                  <p className="text-zinc-300 text-sm font-medium">{user.onboarding.objetivo}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-0.5">Días/semana</p>
                  <p className="text-zinc-300 text-sm font-medium">{user.onboarding.dias_por_semana}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-0.5">Equipamiento</p>
                  <p className="text-zinc-300 text-sm font-medium">{user.onboarding.acceso_gimnasio}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-0.5">Limitaciones</p>
                  <p className="text-zinc-300 text-sm font-medium">{user.onboarding.limitaciones || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="mb-5 bg-carbon/30 rounded-xl p-4">
                <p className="text-zinc-600 text-xs italic">Sin respuestas de onboarding</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3">
              {user.hasPlan && (
                <button
                  onClick={() => setUploaderTarget({ userId: user.user_id, userName: user.name })}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:border-white/20 hover:text-white transition-all"
                >
                  Reemplazar ↺
                </button>
              )}
              <button
                onClick={() => setUploaderTarget({ userId: user.user_id, userName: user.name })}
                className="px-5 py-2 rounded-xl bg-copper/10 border border-copper/30 text-copper text-xs font-black uppercase tracking-widest hover:bg-copper hover:text-white transition-all"
              >
                {user.hasPlan ? 'Ver / Editar' : 'Subir plan ↑'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de upload */}
      {uploaderTarget && (
        <PlanUploader
          userId={uploaderTarget.userId}
          userName={uploaderTarget.userName}
          onClose={() => setUploaderTarget(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
