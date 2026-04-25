'use client'

import { useAppStore } from '@/store/appStore'

export default function LanguageSelector() {
  const { lang, setLang } = useAppStore()
  
  const handleToggle = () => {
    setLang(lang === 'es' ? 'en' : 'es')
  }

  // Alineado horizontalmente con el login (top-6) y posicionado a su izquierda
  return (
    <div className="absolute top-6 right-[130px] md:right-[150px] z-[60]">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-sm font-black text-[10px] md:text-[11px] tracking-tight transition-all hover:bg-black/30 cursor-pointer"
      >
        <span className={lang === 'es' ? 'text-copper' : 'text-zinc-500'}>ES</span>
        <span className="text-zinc-700">|</span>
        <span className={lang === 'en' ? 'text-copper' : 'text-zinc-500'}>EN</span>
      </button>
    </div>
  )
}
