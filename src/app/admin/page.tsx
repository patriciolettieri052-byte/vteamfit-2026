'use client'

import { useRouter } from 'next/navigation'
import UserList from '@/components/admin/UserList'

export default function AdminPage() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-carbon px-6 py-10 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div>
          <p className="text-copper text-[10px] font-black tracking-[0.3em] uppercase mb-1">VTEAMFIT</p>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">Admin Panel</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl border border-white/10 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:border-white/20 hover:text-white transition-all"
        >
          Salir
        </button>
      </header>

      {/* Sección usuarios */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">
            Usuarios — Entrena Conmigo
          </h2>
          <div className="w-2 h-2 rounded-full bg-copper animate-pulse" />
        </div>

        <UserList />
      </section>

      {/* Info del formato Excel */}
      <section className="mt-14 bg-surface/30 rounded-2xl p-6 border border-white/5">
        <h3 className="text-copper font-black uppercase tracking-widest text-xs mb-4">
          Formato del Excel
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-zinc-400 font-mono">
            <thead>
              <tr className="border-b border-white/5">
                {['Col A', 'Col B', 'Col C', 'Col D', 'Col E', 'Col F', 'Col G'].map(col => (
                  <th key={col} className="text-left py-2 pr-4 text-zinc-600 font-bold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {['semana', 'dia', 'ejercicio', 'series', 'repeticiones', 'descanso_seg', 'notas'].map(col => (
                  <td key={col} className="py-2 pr-4 text-copper/70">{col}</td>
                ))}
              </tr>
              <tr>
                {['1', '1', 'hip-thrust', '3', '12-15', '60', 'Opcional'].map(col => (
                  <td key={col} className="py-2 pr-4 text-zinc-500">{col}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-zinc-600 text-xs mt-4 leading-relaxed">
          La columna <span className="text-copper/80">ejercicio</span> debe ser el slug exacto (ej: <span className="font-mono text-zinc-400">hip-thrust</span>). Para días de descanso escribí <span className="font-mono text-zinc-400">descanso</span> o dejá la fila vacía.
        </p>
      </section>
    </main>
  )
}
