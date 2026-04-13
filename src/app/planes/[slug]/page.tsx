'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { getPlanBySlug } from '@/data/plans'
import PlanHero from '@/components/plan/PlanHero'
import PlanFeatures from '@/components/plan/PlanFeatures'
import StartButton from '@/components/plan/StartButton'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { useAppStore } from '@/store/appStore'
import Link from 'next/link'

export default function PlanDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const plan = getPlanBySlug(resolvedParams.slug)
  const { lang } = useAppStore()
  
  if (!plan) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-carbon md:pb-12 pb-36 relative selection:bg-copper selection:text-white">
      {/* Back button */}
      <Link 
        href="/#planes" 
        className="absolute top-6 left-6 z-50 bg-black/40 backdrop-blur-xl px-5 py-3 rounded-full border border-white/10 text-white font-bold tracking-widest uppercase text-xs hover:bg-white/10 hover:-translate-x-1 transition-all shadow-xl"
      >
        {lang === 'es' ? '← Volver' : '← Back'}
      </Link>
      
      {/* Global Language Selector */}
      <LanguageSelector />
      
      {/* Content */}
      <PlanHero plan={plan} lang={lang} />
      <PlanFeatures plan={plan} lang={lang} />
      
      {/* Call to Action */}
      <StartButton lang={lang} planSlug={plan.slug} />
    </main>
  )
}
