import Link from 'next/link'

export default function MorePlans({ lang }: { lang: 'es' | 'en' }) {
  return (
    <div className="w-full bg-copper/5 p-8 rounded-[2.5rem] border border-copper/20 shadow-xl relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-copper/10 blur-3xl -mr-16 -mt-16" />

      <div className="relative z-10">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">
          {lang === 'es' ? '¿Lista para otro desafío?' : 'Ready for another challenge?'}
        </h3>
        <p className="text-zinc-400 font-medium text-sm mb-6 max-w-[200px]">
          {lang === 'es' 
            ? 'Explora nuevos programas diseñados por Vicky Torres.' 
            : 'Explore new workout programs designed by Vicky Torres.'}
        </p>

        <Link 
          href="/#planes"
          className="inline-flex items-center gap-2 bg-copper text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl shadow-lg hover:bg-[#ff8566] transition-all hover:scale-105 active:scale-95"
        >
          {lang === 'es' ? 'Ver Catálogo' : 'View Catalog'}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}
