'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

const flags: Record<string, string> = {
  es: 'https://flagcdn.com/es.svg',
  en: 'https://flagcdn.com/gb.svg',
  pt: 'https://flagcdn.com/pt.svg',
  it: 'https://flagcdn.com/it.svg',
  ru: 'https://flagcdn.com/ru.svg',
}

export default function LanguageSelector({ className = "absolute top-6 right-[130px] md:right-[150px] z-[60]" }: { className?: string }) {
  const { lang, setLang } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSelect = (newLang: 'es' | 'en' | 'pt' | 'it' | 'ru') => {
    setLang(newLang)
    setIsOpen(false)
  }

  // Cierra el menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={className} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-sm transition-all hover:bg-black/30 cursor-pointer"
      >
        <img 
          src={flags[lang] || flags['es']} 
          alt={lang} 
          className="w-[18px] h-[18px] object-cover rounded-full shadow-sm"
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 flex flex-col bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 min-w-0 animate-in fade-in slide-in-from-top-2 duration-200 z-[70]">
          {Object.entries(flags).map(([key, url]) => (
            <button
              key={key}
              onClick={() => handleSelect(key as any)}
              className={`flex items-center justify-center px-4 py-2.5 hover:bg-white/5 transition-colors ${
                lang === key ? 'bg-white/5' : ''
              }`}
            >
              <img 
                src={url} 
                alt={key} 
                className="w-5 h-5 object-cover rounded-full shadow-sm"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}