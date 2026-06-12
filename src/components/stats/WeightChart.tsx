'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '@/store/appStore'

export default function WeightChart({ lang }: { lang: 'es' | 'en' }) {
  const { progress } = useAppStore()
  
  // Transform weightHistory dates for better labels
  const data = progress.weightHistory.map(entry => ({
    date: entry.date.split('-').slice(1).join('/'), // Only MM/DD 
    weight: entry.weight
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-carbon border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-xl font-black text-copper italic">{payload[0].value} <span className="text-xs">kg</span></p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full bg-surface p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col gap-6 overflow-hidden">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
          {lang === 'es' ? 'Evolución de Peso' : 'Weight Progress'}
        </h3>
        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            {lang === 'es' ? 'Últimos registros' : 'Latest logs'}
        </span>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#666', fontSize: 10, fontWeight: 900}} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#666', fontSize: 10, fontWeight: 900}} 
                domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#897449" 
                strokeWidth={2} 
                dot={{ fill: '#897449', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: '#897449', r: 6 }}
                animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
