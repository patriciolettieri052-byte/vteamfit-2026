'use client'

import HeroSection from '@/components/landing/HeroSection'
import PlansGrid from '@/components/landing/PlansGrid'
import BioSection from '@/components/landing/BioSection'
import { useAppStore } from '@/store/appStore'

export default function Home() {
  const { lang } = useAppStore()
  
  return (
    <main className="min-h-screen bg-carbon overflow-x-hidden selection:bg-copper selection:text-white relative">
      <HeroSection />
      <section id="planes" className="scroll-mt-0">
        <PlansGrid lang={lang} />
      </section>
      <BioSection lang={lang} />
    </main>
  )
}
