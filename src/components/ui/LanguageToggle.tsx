'use client'

import { useAppStore } from '@/store/appStore'

export default function LanguageToggle() {
  const { lang, setLang } = useAppStore()

  return (
    <div className="flex items-center gap-2 p-1.5 bg-surface border border-white/5 rounded-2xl w-fit">
      <button
        onClick={() => setLang('es')}
        className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
          lang === 'es' 
            ? 'bg-copper text-white shadow-lg' 
            : 'text-zinc-500 hover:text-white'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
          lang === 'en' 
            ? 'bg-copper text-white shadow-lg' 
            : 'text-zinc-500 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  )
}
