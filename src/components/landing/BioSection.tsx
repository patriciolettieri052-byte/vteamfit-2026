import Image from 'next/image'

export default function BioSection({ lang }: { lang: 'es' | 'en' }) {
  return (
    <section className="bg-surface py-24 md:py-32 px-6 border-t border-white/5 relative overflow-hidden">
      {/* Ambient background flair */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-copper/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20 relative z-10">
        <div className="w-56 h-56 md:w-72 md:h-72 shrink-0 rounded-full overflow-hidden border-[6px] border-carbon relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <Image 
            src="/images/fotos/vicky-torres.webp" 
            alt="Vicky Torres" 
            fill
            className="object-cover object-[40%_top] md:object-center"
          />
        </div>
        
        <div className="flex flex-col text-center md:text-left md:items-start max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-8">
            Vicky Torres
          </h2>
          <blockquote className="text-xl md:text-3xl text-zinc-300 font-medium leading-snug md:leading-normal border-l-0 md:border-l-4 border-copper/50 pl-0 md:pl-8 text-balance">
            {lang === 'es' ? (
              <p>
                "Con VTeamFit quiero que logres tus objetivos, llegando al éxito. Y te aseguro, que ese éxito, ¡es la mayor satisfacción que puedes sentir! Solo cree en ti."
              </p>
            ) : (
              <p>
                "With VTeamFit I want you to achieve your goals, reaching success. And I assure you, that success is the greatest satisfaction you can feel! Just believe in yourself."
              </p>
            )}
          </blockquote>
        </div>
      </div>
    </section>
  )
}
