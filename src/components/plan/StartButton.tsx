import Link from 'next/link'

export default function StartButton({ lang, planSlug }: { lang: 'es' | 'en', planSlug: string }) {
  return (
    <div className="fixed bottom-0 left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-50 md:static md:bg-transparent md:border-none md:p-8 flex justify-center">
      <Link 
        href={`/registro?plan=${planSlug}`}
        className="w-max bg-copper text-white font-black text-lg uppercase tracking-widest py-4 px-8 rounded-full shadow-[0_0_32px_rgba(255,107,74,0.3)] hover:shadow-[0_0_48px_rgba(255,107,74,0.6)] hover:bg-[#ff8566] transition-all hover:-translate-y-2 active:scale-95 duration-300 flex items-center justify-center"
      >
        {lang === 'es' ? 'Comenzar Ahora' : 'Start Now'}
      </Link>
    </div>
  )
}
