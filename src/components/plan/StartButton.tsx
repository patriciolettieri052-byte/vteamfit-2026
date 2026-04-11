import Link from 'next/link'

export default function StartButton({ lang }: { lang: 'es' | 'en' }) {
  return (
    <div className="fixed bottom-0 left-0 w-full p-6 bg-carbon/90 backdrop-blur-xl border-t border-white/5 z-50 md:static md:bg-transparent md:border-none md:p-8 md:flex md:justify-center">
      <Link 
        href="/dashboard"
        className="w-full md:w-auto md:min-w-[400px] flex items-center justify-center bg-copper text-white font-black text-xl md:text-2xl uppercase tracking-widest py-6 px-12 rounded-full shadow-[0_0_32px_rgba(255,107,74,0.3)] hover:shadow-[0_0_48px_rgba(255,107,74,0.6)] hover:bg-[#ff8566] transition-all hover:-translate-y-2 active:scale-95 duration-300"
      >
        {lang === 'es' ? 'Comenzar Ahora' : 'Start Now'}
      </Link>
    </div>
  )
}
