'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'
import StartButton from '@/components/plan/StartButton'
import DiscountCode, { DiscountData } from '@/components/plan/DiscountCode'

const PLAN_SLUG = 'entrena-conmigo'
const PLAN_PRICE = 390

const FEATURES_ES = [
  'Plan de entrenamiento 100% personalizado',
  'Diseñado según tus objetivos y disponibilidad',
  'Comunicación directa con Vicky vía WhatsApp',
  'Ajustes mensuales según tu progreso',
  'Videollamada mensual incluida',
  'Acceso a todos los videos de ejercicios',
]

const FEATURES_EN = [
  '100% personalized training plan',
  'Designed according to your goals and availability',
  'Direct communication with Vicky via WhatsApp',
  'Monthly adjustments based on your progress',
  'Monthly video call included',
  'Access to all exercise videos',
]

export default function EntrenConmigoPage() {
  const { lang } = useAppStore()
  const [discountData, setDiscountData] = useState<DiscountData | null>(null)

  const features = lang === 'es' ? FEATURES_ES : FEATURES_EN
  const cycleLabel = lang === 'es' ? 'mensual' : 'monthly'

  const vickyQuote = lang === 'es' 
    ? 'Te haré tu entrenamiento personalizado según tus necesidades y objetivos, cargándote semanalmente tus éntrenos en la web para hacer tu rutina en tu tiempo, teniendo diariamente si es necesario contacto a través de mi WhatsApp personal y una videollamada mensual gratuita, "mi objetivo serás tu"'
    : 'I will create your personalized training according to your needs and goals, uploading your workouts weekly to the web so you can do your routine in your own time, with daily contact if necessary through my personal WhatsApp and a free monthly video call, "my goal will be you"'

  return (
    <main className="min-h-screen bg-carbon md:pb-12 pb-36 relative selection:bg-copper selection:text-white">
      {/* Back button */}
      <Link
        href="/#planes"
        className="absolute top-6 left-6 z-50 bg-black/40 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 text-white font-bold tracking-widest uppercase text-xs hover:bg-white/10 hover:-translate-x-1 transition-all shadow-xl"
      >
        {lang === 'es' ? '← Volver' : '← Back'}
      </Link>

      {/* Hero */}
      <section className="relative w-full h-[60vh] min-h-[450px] flex flex-col justify-end pb-12 px-6">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/fotos/vicky-personalizado.jpg"
            alt="Entrena Conmigo — Vicky Torres"
            fill
            priority
            className="object-cover object-[center_15%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center md:items-start text-center md:text-left gap-4">
          {/* Badge */}
          <span className="bg-copper text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
            {lang === 'es' ? 'PERSONALIZADO' : 'PERSONALIZED'}
          </span>

          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter text-balance drop-shadow-lg">
            {lang === 'es' ? 'ENTRENA CONMIGO' : 'TRAIN WITH ME'}
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 font-bold tracking-widest uppercase">
            <span className="bg-surface/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 text-zinc-200">
              30 {lang === 'es' ? 'días' : 'days'}
            </span>
            {!discountData && (
              <div className="flex items-center gap-2 text-copper drop-shadow-md">
                <span className="text-4xl font-black">${PLAN_PRICE}</span>
                <span className="text-lg font-sans text-dim mt-1 uppercase">{cycleLabel}</span>
              </div>
            )}
            {discountData && (
              <div className="flex items-center gap-3 drop-shadow-md">
                <span className="text-dim line-through text-xl">${PLAN_PRICE}</span>
                <span className="text-copper font-black text-4xl">
                  {discountData.type === 'free' ? (lang === 'es' ? 'GRATIS' : 'FREE') : `$${discountData.finalPrice}`}
                </span>
                {discountData.type !== 'free' && (
                  <span className="text-lg font-sans text-dim mt-1 uppercase">{cycleLabel}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-carbon py-12 md:py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-12">

          {/* ¿Qué incluye? */}
          <div className="bg-surface rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-copper/10 blur-[60px] rounded-full pointer-events-none" />
            <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight mb-8 relative z-10">
              {lang === 'es' ? '¿Qué incluye?' : "What's included?"}
            </h2>
            <ul className="flex flex-col gap-4 relative z-10">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-copper/20 border border-copper/40 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-copper">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span className="text-zinc-200 font-medium text-base md:text-lg leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mensaje de Vicky */}
          <div className="relative py-8 md:py-12 px-8 bg-copper/5 border-l-4 border-copper rounded-r-3xl overflow-hidden">
            <span className="absolute top-4 left-4 text-copper/10 text-8xl font-serif select-none">“</span>
            <p className="text-zinc-200 text-lg md:text-2xl font-bold italic leading-relaxed relative z-10">
              {vickyQuote.split('"mi objetivo serás tu"')[0]}
              <span className="text-copper font-black block mt-4 md:inline md:mt-0">
                "{lang === 'es' ? 'mi objetivo serás tu' : 'my goal will be you'}"
              </span>
            </p>
          </div>

          {/* Cómo funciona */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                title_es: 'Respondés el onboarding',
                desc_es: 'Cuatro preguntas sobre tus objetivos, días disponibles y equipamiento.',
                title_en: 'Complete onboarding',
                desc_en: 'Four questions about your goals, available days and equipment.',
              },
              {
                icon: '⚡',
                title_es: 'Vicky diseña tu plan',
                desc_es: 'En 24-48hs tenés tu entrenamiento 100% personalizado listo.',
                title_en: 'Vicky designs your plan',
                desc_en: 'Within 24-48hs your 100% personalized training plan is ready.',
              },
              {
                icon: '💪',
                title_es: 'Entrenás con Vicky',
                desc_es: 'Acceso directo por WhatsApp y ajustes mensuales a medida.',
                title_en: 'Train with Vicky',
                desc_en: 'Direct WhatsApp access and monthly custom adjustments.',
              },
            ].map((step, i) => (
              <div key={i} className="bg-surface/50 rounded-2xl p-6 border border-white/5 flex flex-col gap-3 text-center">
                <span className="text-4xl">{step.icon}</span>
                <h3 className="text-copper font-black uppercase tracking-widest text-sm">
                  {lang === 'es' ? step.title_es : step.title_en}
                </h3>
                <p className="text-zinc-400 font-medium leading-relaxed text-sm">
                  {lang === 'es' ? step.desc_es : step.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA & Discount */}
      <div className="w-full flex-col items-center justify-center pt-8 pb-10">
        <StartButton lang={lang} planSlug={PLAN_SLUG} discountData={discountData} />
        <DiscountCode
          planSlug={PLAN_SLUG}
          planPrice={PLAN_PRICE}
          onDiscountApplied={setDiscountData}
          lang={lang}
        />
      </div>
    </main>
  )
}
