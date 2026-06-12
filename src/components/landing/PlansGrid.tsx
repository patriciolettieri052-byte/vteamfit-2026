import { PLANS } from '@/data/plans'
import PlanCard from './PlanCard'

export default function PlansGrid({ lang }: { lang: 'es' | 'en' }) {
  return (
    <div className="w-full bg-carbon py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-16">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase mb-4 tracking-tighter">
            {lang === 'es' ? 'Elige tu plan' : 'Choose your plan'}
          </h2>
          <div className="w-20 h-1.5 bg-copper mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  )
}
