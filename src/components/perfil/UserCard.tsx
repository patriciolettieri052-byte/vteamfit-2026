'use client'

import { useAppStore } from '@/store/appStore'

export default function UserCard({ lang }: { lang: string }) {
  const { userName, progress } = useAppStore()
  const currentWeight = progress.weightHistory[progress.weightHistory.length - 1]?.weight || 0
  const initial = userName.charAt(0).toUpperCase()

  return (
    <div className="w-full bg-surface p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-copper/10 blur-3xl rounded-full" />
      
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-carbon border-2 border-copper flex items-center justify-center text-4xl font-black text-copper shadow-xl ring-8 ring-copper/5">
        {initial}
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">
          {userName}
        </h2>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
          {lang === 'es' ? 'Miembro Premium' : 'Premium Member'}
        </p>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4 w-full pt-4">
        <div className="bg-carbon p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-xl font-black text-white italic block">{currentWeight} <span className="text-[10px]">kg</span></span>
            <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{lang === 'es' ? 'Peso Actual' : 'Current Weight'}</span>
        </div>
        <div className="bg-carbon p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-xl font-black text-white italic block">1.65 <span className="text-[10px]">m</span></span>
            <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">{lang === 'es' ? 'Estatura' : 'Height'}</span>
        </div>
      </div>
    </div>
  )
}
