'use client'

import { useRef, useState } from 'react'

interface Props {
  userId: string
  userName: string
  onClose: () => void
  onSuccess: (summary: string) => void
}

export default function PlanUploader({ userId, userName, onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setErrors([])

    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload-plan', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        onSuccess(data.summary)
      } else {
        setErrors(data.errors ?? [data.error ?? 'Error al procesar el archivo'])
      }
    } catch {
      setErrors(['Error de conexión. Intentá de nuevo.'])
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-surface rounded-[2rem] p-8 border border-white/10 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-carbon border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        <h2 className="text-xl font-black text-white italic uppercase tracking-tight mb-1">
          Subir plan
        </h2>
        <p className="text-zinc-400 text-sm font-medium mb-8">
          para <span className="text-copper font-bold">{userName}</span>
        </p>

        {/* File drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            file
              ? 'border-copper/60 bg-copper/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={e => {
              setErrors([])
              setFile(e.target.files?.[0] ?? null)
            }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">📊</span>
              <p className="text-white font-bold text-sm truncate max-w-full">{file.name}</p>
              <p className="text-zinc-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-carbon border border-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="text-zinc-400 text-sm font-medium">
                Seleccioná el archivo Excel
              </p>
              <p className="text-zinc-600 text-xs">Formato: .xlsx — usar la plantilla</p>
            </div>
          )}
        </div>

        {/* Errores de validación */}
        {errors.length > 0 && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-2">
              {errors.length === 1 && !errors[0].includes('\n') ? 'Error' : `${errors.length} errores encontrados`}
            </p>
            <ul className="flex flex-col gap-1">
              {errors.map((err, i) => (
                <li key={i} className="text-red-300 text-xs font-medium">• {err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm uppercase tracking-widest hover:border-white/20 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex-1 py-3 rounded-xl bg-copper text-white font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,107,74,0.2)] hover:bg-[#ff8566] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Procesar y cargar ↑'}
          </button>
        </div>
      </div>
    </div>
  )
}
