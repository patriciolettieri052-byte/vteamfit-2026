'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'

export default function HeroSection() {
  const { lang, setLang } = useAppStore()

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center pb-12 md:pb-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/fotos/inicio.webp"
          alt="Hero background"
          fill
          priority
          className="object-cover object-[50%_15%] md:object-[50%_35%]"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-carbon" />
      </div>

      {/* Header Container (Logo) */}
      <div className="absolute -top-1 -left-6 md:-top-4 md:-left-12 z-50 pointer-events-none">
        <div className="relative w-[160px] h-[92px] md:w-[306px] md:h-[153px]">
          <Image 
            src="/images/logo.svg" 
            alt="VTeamFit" 
            fill 
            className="object-contain object-top-left pointer-events-auto" 
            priority
          />
        </div>
      </div>

      {/* Header Right (Language + Login) */}
      <div className="absolute top-6 right-4 md:right-6 z-[60] flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 font-black text-[10px] tracking-tight hover:bg-black/30 cursor-pointer"
        >
          <span className={lang === 'es' ? 'text-copper' : 'text-zinc-500'}>ES</span>
          <span className="text-zinc-700">|</span>
          <span className={lang !== 'es' ? 'text-copper' : 'text-zinc-500'}>EN</span>
        </button>

        {/* Login Button */}
        <Link
          href="/login"
          className="bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 text-white text-[10px] md:text-xs uppercase tracking-widest font-black hover:bg-copper hover:border-transparent transition-all shadow-xl active:scale-95"
        >
          {lang === 'es' ? 'Inicia sesión' : 'Login'}
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 mt-80 md:mt-64">
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

        <p className="text-white text-sm md:text-base text-center max-w-2xl mx-auto leading-relaxed mt-10 px-4 font-medium">
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
