'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomOnboardingAnswers } from '@/types'

const TOTAL_STEPS = 4

const OBJETIVOS_ES = ['Perder peso', 'Ganar músculo', 'Mejorar rendimiento', 'Otro']
const OBJETIVOS_EN = ['Lose weight', 'Gain muscle', 'Improve performance', 'Other']

const DIAS = [2, 3, 4, 5, 6]

const EQUIPAMIENTO_ES = ['Gimnasio completo', 'Equipamiento en casa', 'Solo peso corporal']
const EQUIPAMIENTO_EN = ['Full gym', 'Home equipment', 'Bodyweight only']

interface Props {
  lang?: string
}

export default function CustomOnboarding({ lang = 'es' }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [answers, setAnswers] = useState<Partial<CustomOnboardingAnswers>>({
    objetivo: '',
    dias_por_semana: 0,
    acceso_gimnasio: '',
    limitaciones: '',
  })

  const isEs = lang === 'es'

  // Validación por paso
  const canProceed = () => {
    if (step === 1) return !!answers.objetivo
    if (step === 2) return !!answers.dias_por_semana
    if (step === 3) return !!answers.acceso_gimnasio
    if (step === 4) return true // limitaciones es opcional
    return false
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/custom-onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (res.ok) {
        router.push('/dashboard/entrena-conmigo/espera')
      } else {
        const data = await res.json()
        setError(data.error ?? (isEs ? 'Ocurrió un error. Intentá de nuevo.' : 'An error occurred. Please try again.'))
      }
    } catch {
      setError(isEs ? 'Error de conexión. Intentá de nuevo.' : 'Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center px-6 py-12">
      {/* Encabezado */}
      <div className="w-full max-w-md mb-10 text-center">
        <p className="text-copper text-[10px] font-black tracking-[0.3em] uppercase mb-3">
          ENTRENA CONMIGO
        </p>
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
          {isEs ? 'Contanos sobre vos' : 'Tell us about you'}
        </h1>
        <p className="text-zinc-400 text-sm font-medium mt-2">
          {isEs
            ? 'Vicky diseñará tu plan según estas respuestas'
            : 'Vicky will design your plan based on these answers'}
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-md mb-10">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i + 1 < step ? 'bg-copper' : i + 1 === step ? 'bg-copper/60' : 'bg-zinc-800'
              }`}
              style={{ width: `${96 / TOTAL_STEPS}%` }}
            />
          ))}
        </div>
        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest text-right">
          {isEs ? `Paso ${step} de ${TOTAL_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}
        </p>
      </div>

      {/* Tarjeta del paso */}
      <div className="w-full max-w-md bg-surface rounded-[2rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden min-h-[320px] flex flex-col">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-copper/10 blur-[50px] rounded-full pointer-events-none" />

        {/* PASO 1: Objetivo */}
        {step === 1 && (
          <div className="flex flex-col gap-6 relative z-10 flex-1">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tight">
              {isEs ? '¿Cuál es tu objetivo principal?' : "What's your main goal?"}
            </h2>
            <div className="flex flex-col gap-3">
              {(isEs ? OBJETIVOS_ES : OBJETIVOS_EN).map((opcion, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers(a => ({ ...a, objetivo: opcion }))}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold transition-all duration-200 ${
                    answers.objetivo === opcion
                      ? 'border-copper bg-copper/10 text-white shadow-[0_0_16px_rgba(255,107,74,0.2)]'
                      : 'border-white/10 bg-carbon/50 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Días */}
        {step === 2 && (
          <div className="flex flex-col gap-6 relative z-10 flex-1">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tight">
              {isEs ? '¿Cuántos días por semana podés entrenar?' : 'How many days per week can you train?'}
            </h2>
            <div className="flex gap-3 flex-wrap">
              {DIAS.map((d) => (
                <button
                  key={d}
                  onClick={() => setAnswers(a => ({ ...a, dias_por_semana: d }))}
                  className={`w-16 h-16 rounded-2xl border-2 font-black text-2xl transition-all duration-200 ${
                    answers.dias_por_semana === d
                      ? 'border-copper bg-copper/10 text-white shadow-[0_0_16px_rgba(255,107,74,0.2)]'
                      : 'border-white/10 bg-carbon/50 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-zinc-500 text-sm font-medium">
              {isEs ? 'días por semana' : 'days per week'}
            </p>
          </div>
        )}

        {/* PASO 3: Equipamiento */}
        {step === 3 && (
          <div className="flex flex-col gap-6 relative z-10 flex-1">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tight">
              {isEs ? '¿Tenés acceso a gimnasio?' : 'Do you have gym access?'}
            </h2>
            <div className="flex flex-col gap-3">
              {(isEs ? EQUIPAMIENTO_ES : EQUIPAMIENTO_EN).map((opcion, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers(a => ({ ...a, acceso_gimnasio: opcion }))}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold transition-all duration-200 ${
                    answers.acceso_gimnasio === opcion
                      ? 'border-copper bg-copper/10 text-white shadow-[0_0_16px_rgba(255,107,74,0.2)]'
                      : 'border-white/10 bg-carbon/50 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 4: Limitaciones */}
        {step === 4 && (
          <div className="flex flex-col gap-6 relative z-10 flex-1">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tight">
              {isEs
                ? '¿Alguna lesión o limitación física que debamos considerar?'
                : 'Any injury or physical limitation we should consider?'}
            </h2>
            <textarea
              value={answers.limitaciones}
              onChange={(e) => setAnswers(a => ({ ...a, limitaciones: e.target.value }))}
              placeholder={isEs ? 'Ej: dolor de rodilla, hernia... (opcional)' : 'E.g.: knee pain, hernia... (optional)'}
              rows={5}
              className="w-full bg-carbon/80 border border-white/10 rounded-2xl px-5 py-4 text-zinc-200 placeholder:text-zinc-600 font-medium resize-none focus:outline-none focus:border-copper transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className="w-full max-w-md flex gap-4 mt-6">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold uppercase tracking-widest hover:border-white/20 hover:text-white transition-all"
          >
            {isEs ? 'Atrás' : 'Back'}
          </button>
        )}

        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="flex-1 py-4 rounded-2xl bg-copper text-white font-black uppercase tracking-widest shadow-[0_0_24px_rgba(255,107,74,0.25)] hover:bg-[#ff8566] hover:-translate-y-1 transition-all duration-200 disabled:opacity-40 disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            {isEs ? 'Siguiente →' : 'Next →'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-4 rounded-2xl bg-copper text-white font-black uppercase tracking-widest shadow-[0_0_24px_rgba(255,107,74,0.25)] hover:bg-[#ff8566] hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
          >
            {submitting
              ? (isEs ? 'Enviando...' : 'Sending...')
              : (isEs ? 'Enviar y comenzar ✓' : 'Submit and start ✓')}
          </button>
        )}
      </div>
    </div>
  )
}
