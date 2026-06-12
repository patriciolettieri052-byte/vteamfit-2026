import { useAppStore } from '@/store/appStore'

export default function DaySummary({ dayNum, exercisesCount, lang }: { dayNum: number, exercisesCount: number, lang: 'es' | 'en' }) {
  const { progress } = useAppStore()
  const duration = progress.sessionDuration[dayNum] || 0

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-1000 delay-500">
      <div className="bg-surface p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-copper/20 flex items-center justify-center border-2 border-copper shadow-[0_0_40px_rgba(255,107,74,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2">
            {lang === 'es' ? '¡Misión Cumplida!' : 'Mission Accomplished!'}
          </h2>
          <p className="text-zinc-400 font-medium leading-tight">
            {lang === 'es' ? 'Has dado un paso más hacia tu mejor versión.' : 'One step closer to your best version.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full pt-4">
          <div className="bg-carbon p-5 rounded-3xl border border-white/5">
            <span className="text-copper font-black text-2xl italic block">{exercisesCount}</span>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{lang === 'es' ? 'Ejercicios' : 'Exercises'}</span>
          </div>
          <div className="bg-carbon p-5 rounded-3xl border border-white/5">
            <span className="text-copper font-black text-2xl italic">{duration}</span>
            <span className="text-white text-xs font-black italic ml-1">min</span>
            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mt-0.5">{lang === 'es' ? 'Tiempo Total' : 'Total Time'}</span>
          </div>
        </div>
      </div>

      <div className="bg-copper/10 p-6 rounded-[2rem] border border-copper/30 text-center">
        <p className="text-white font-bold italic">
          {lang === 'es' 
            ? '“La disciplina es el puente entre tus metas y tus logros.”' 
            : '“Discipline is the bridge between goals and accomplishment.”'}
        </p>
      </div>
    </div>
  )
}
