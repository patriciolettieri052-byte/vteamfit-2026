'use client'

import { useEffect, useState } from 'react'

export default function ProgressRing({ completed, total, lang }: { completed: number, total: number, lang: string }) {
  const size = 160
  const percentage = Math.min(Math.round((completed / total) * 100), 100)
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center bg-surface rounded-[3rem] p-8 border border-white/5 shadow-2xl h-[240px]">
      <div className="flex flex-col items-center justify-center relative">
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1A1A1A"
            strokeWidth={12}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#897449"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1.2s ease-in-out',
            }}
          />
        </svg>
        {/* Texto centrado */}
        <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
          <span className="text-4xl font-black text-white italic tracking-tighter">{percentage}%</span>
          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.2em]">
            {lang === 'es' ? 'Completado' : 'Completed'}
          </span>
        </div>
      </div>
    </div>
  )
}
