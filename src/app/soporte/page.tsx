'use client'

import { useRouter } from 'next/navigation'

export default function SoportePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-carbon max-w-md mx-auto w-full px-6 pt-12 pb-16 flex flex-col gap-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-dim text-sm hover:text-copper transition-colors w-fit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Volver
      </button>

      <header>
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Soporte y Ayuda
        </h1>
        <div className="w-8 h-0.5 bg-copper mt-3" />
      </header>

      {/* Contacto */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-copper uppercase tracking-widest">Contacto</h2>
        <div className="bg-surface rounded-2xl p-5 border border-white/5">
          <p className="text-dim text-sm leading-relaxed">
            Para consultas, escríbenos a:
          </p>
          <a
            href="mailto:soporte@vteamfit.app"
            className="text-copper font-bold text-sm mt-2 block hover:underline"
          >
            soporte@vteamfit.app
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-copper uppercase tracking-widest">Preguntas Frecuentes</h2>
        <div className="flex flex-col gap-3">
          <FaqItem
            question="¿Cómo accedo a mi plan de entrenamiento?"
            answer="Ingresa con tu usuario y contraseña. Tu plan estará disponible en tu dashboard personal."
          />
          <FaqItem
            question="¿Puedo pausar mi plan?"
            answer="Una vez activado el plan, no se realizan reembolsos. Si tienes un problema, contáctanos a soporte@vteamfit.app."
          />
          <FaqItem
            question="¿Cómo registro mi progreso?"
            answer="Desde tu dashboard puedes registrar tu peso semanal y marcar los días completados."
          />
        </div>
      </section>
    </main>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-white/5 flex flex-col gap-2">
      <p className="text-white font-bold text-sm">{question}</p>
      <p className="text-dim text-sm leading-relaxed">{answer}</p>
    </div>
  )
}
