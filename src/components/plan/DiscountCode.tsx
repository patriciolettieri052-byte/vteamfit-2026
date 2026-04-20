'use client'

import { useState } from 'react'

export interface DiscountData {
  valid: boolean;
  type: string;
  value: number;
  finalPrice: number;
  discountId: string;
  code: string;
  message: string;
}

interface DiscountCodeProps {
  planSlug: string;
  planPrice: number;
  onDiscountApplied: (data: DiscountData | null) => void;
  lang?: 'es' | 'en';
}

export default function DiscountCode({ planSlug, planPrice, onDiscountApplied, lang = 'es' }: DiscountCodeProps) {
  const [inputCode, setInputCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  const [message, setMessage] = useState('')

  const handleApply = async () => {
    if (!inputCode.trim()) return

    setStatus('loading')
    setMessage('')
    
    try {
      const res = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode, planPrice })
      })
      const data = await res.json()

      if (data.valid) {
        setStatus('valid')
        setMessage(data.message)
        onDiscountApplied(data)
      } else {
        setStatus('invalid')
        setMessage(data.message)
        onDiscountApplied(null)
      }
    } catch (e) {
      console.error(e)
      setStatus('invalid')
      setMessage(lang === 'es' ? 'Error al validar el código' : 'Error validating code')
      onDiscountApplied(null)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-6 pt-6 border-t border-white/10 flex flex-col items-center">
      <p className="text-sm tracking-widest uppercase font-bold text-dim mb-3">
        {lang === 'es' ? '¿Tenés un código de descuento?' : 'Do you have a discount code?'}
      </p>
      <div className="flex gap-2 w-full">
        <input 
          type="text" 
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder={lang === 'es' ? 'Ingresá tu código' : 'Enter your code'}
          className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 uppercase placeholder:text-white/20 outline-none focus:border-copper/50 transition-colors"
          disabled={status === 'loading'}
        />
        <button 
          onClick={handleApply}
          disabled={status === 'loading' || !inputCode.trim()}
          className="border border-copper text-copper hover:bg-copper hover:text-white transition-colors uppercase text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-copper"
        >
          {status === 'loading' ? (lang === 'es' ? '...' : '...') : (lang === 'es' ? 'Aplicar' : 'Apply')}
        </button>
      </div>
      
      {message && (
        <p className={`mt-3 text-sm font-medium ${status === 'valid' ? 'text-copper' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
