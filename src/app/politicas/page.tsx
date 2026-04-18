'use client'

import { useRouter } from 'next/navigation'

export default function PoliticasPage() {
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
          Políticas Legales
        </h1>
        <div className="w-8 h-0.5 bg-copper mt-3" />
      </header>

      {/* Términos de uso */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-copper uppercase tracking-widest">Términos de Uso</h2>
        <div className="bg-surface rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
          <PolicyItem text="Al acceder y usar VTeamFit aceptás los presentes términos." />
          <PolicyItem text="Los planes de entrenamiento son de uso personal e intransferible." />
          <PolicyItem text="El contenido de los planes (videos, rutinas, guías) es propiedad de VTeamFit y no puede ser reproducido ni distribuido sin autorización." />
        </div>
      </section>

      {/* Privacidad */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-copper uppercase tracking-widest">Política de Privacidad</h2>
        <div className="bg-surface rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
          <PolicyItem text="Los datos que recopilamos (nombre, email, métricas físicas) se usan exclusivamente para personalizar tu experiencia en la plataforma." />
          <PolicyItem text="No compartimos tu información con terceros." />
          <p className="text-dim text-sm leading-relaxed">
            Para solicitar la eliminación de tus datos, escribinos a{' '}
            <a
              href="mailto:soporte@vteamfit.app"
              className="text-copper hover:underline font-bold"
            >
              soporte@vteamfit.app
            </a>
            .
          </p>
        </div>
      </section>

      {/* Pagos y Reembolsos */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-copper uppercase tracking-widest">Pagos y Reembolsos</h2>
        <div className="bg-surface rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
          <PolicyItem text="Los pagos se procesan de forma segura a través de PayPal." />
          <p className="text-dim text-sm leading-relaxed">
            Una vez activado el plan, no se realizan reembolsos. Si tenés un problema, contactanos a{' '}
            <a
              href="mailto:soporte@vteamfit.app"
              className="text-copper hover:underline font-bold"
            >
              soporte@vteamfit.app
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  )
}

function PolicyItem({ text }: { text: string }) {
  return (
    <p className="text-dim text-sm leading-relaxed border-l-2 border-copper/30 pl-3">
      {text}
    </p>
  )
}
