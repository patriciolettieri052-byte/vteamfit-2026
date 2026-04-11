'use client'

import { useAppStore } from '@/store/appStore'

export default function LanguageSelector() {
  const { lang, setLang } = useAppStore()
  
  const handleToggle = () => {
    setLang(lang === 'es' ? 'en' : 'es')
  }

  return (
    <div className="absolute top-6 right-6 z-50">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-xl font-bold text-sm tracking-wide transition-transform hover:scale-105 cursor-pointer"
      >
        <span className={lang === 'es' ? 'text-white' : 'text-zinc-500'}>ES</span>
        <span className="text-zinc-600">|</span>
        <span className={lang === 'en' ? 'text-white' : 'text-zinc-500'}>EN</span>
      </button>
    </div>
  )
}
