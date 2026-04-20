'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import { getPlanBySlug } from '@/data/plans'
import PlanHero from '@/components/plan/PlanHero'
import PlanFeatures from '@/components/plan/PlanFeatures'
import StartButton from '@/components/plan/StartButton'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { useAppStore } from '@/store/appStore'
import Link from 'next/link'
import DiscountCode, { DiscountData } from '@/components/plan/DiscountCode'

export default function PlanDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const plan = getPlanBySlug(resolvedParams.slug)
  const { lang } = useAppStore()
  const [discountData, setDiscountData] = useState<DiscountData | null>(null)
  
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
      
      {/* Call to Action & Discount */}
      <div className="w-full flex-col items-center justify-center pt-8 pb-10">
        {discountData ? (
          <div className="text-center mb-4">
            <span className="text-dim line-through text-sm">${plan.price} USD</span>
            <span className="text-copper font-bold text-2xl ml-2">
              {discountData.type === 'free' ? 'GRATIS' : `$${discountData.finalPrice} USD`}
            </span>
          </div>
        ) : (
          <div className="text-center mb-4">
            <span className="text-copper font-bold text-2xl">${plan.price} USD</span>
          </div>
        )}

        {/* StartButton fixed on mobile, static on desktop */}
        <StartButton lang={lang} planSlug={plan.slug} discountData={discountData} />

        <DiscountCode
          planSlug={plan.slug}
          planPrice={plan.price}
          onDiscountApplied={setDiscountData}
          lang={lang}
        />
      </div>
    </main>
  )
}
