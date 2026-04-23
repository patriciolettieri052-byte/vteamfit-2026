import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection({ lang }: { lang: 'es' | 'en' }) {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-end md:justify-center pb-12 md:pb-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/fotos/inicio.webp"
          alt="Hero background"
          fill
          priority
          className="object-cover object-[center_top]"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-carbon" />
      </div>

      {/* Header Container (Logo + Login) */}
      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center md:items-end pb-2 md:pb-4 gap-2 md:gap-6">
        <div className="relative w-[150px] h-[50px] md:w-[240px] md:h-[80px] shrink-0">
          <Image 
            src="/images/logo.svg" 
            alt="VTeamFit" 
            fill 
            className="object-contain object-left" 
            priority
          />
        </div>

        <Link
          href="/login"
          className="text-dim text-[10px] md:text-xs uppercase tracking-widest font-bold hover:text-white transition-colors pb-0 md:pb-4 -ml-4 md:-ml-12 shrink-0"
        >
          {lang === 'es' ? 'Iniciar sesión' : 'Login'}
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 mt-12 md:mt-0">
        <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase mb-4 tracking-tight drop-shadow-xl text-balance">
          {lang === 'es' ? 'TU MEJOR VERSIÓN' : 'YOUR BEST VERSION'}
        </h1>
        <p className="text-zinc-300 text-lg md:text-xl font-medium mb-12 max-w-sm text-balance">
          {lang === 'es' ? 'Planes de entrenamiento para ti' : 'Training plans for you'}
        </p>

        <button
          onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-copper text-white uppercase font-bold text-sm md:text-base tracking-widest px-10 py-5 mx-auto rounded-full shadow-[0_0_24px_rgba(255,107,74,0.4)] hover:shadow-[0_0_32px_rgba(255,107,74,0.6)] hover:bg-[#ff8566] transition-all hover:-translate-y-1 active:scale-95 cursor-pointer"
        >
          {lang === 'es' ? 'VER PLANES' : 'SEE PLANS'}
        </button>

        <p className="text-dim text-xl text-center max-w-2xl mx-auto leading-relaxed mt-10 px-4 font-medium opacity-80">
          {lang === 'es' ? (
            <>
              VTeamFit es una aplicación de fitness creada por Victoria Torres junto a Tito Allemandi, 
              bicampeón de pádel mundial con más de 20 años de experiencia en el mundo de la competición. 
              Construida desde la constancia y conocimiento real.
            </>
          ) : (
            <>
              VTeamFit is a fitness app created by Victoria Torres along with Tito Allemandi, 
              world padel double champion with over 20 years of competition experience. 
              Built from consistency and real knowledge.
            </>
          )}
        </p>
      </div>
    </section>
  )
}
