'use client'

import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-4">
      <div className="relative w-14 h-14">
        {/* Outer Ring - High Contrast */}
        <div className="absolute inset-0 rounded-full border-[3px] border-white/5 border-t-copper animate-spin shadow-[0_0_15px_rgba(255,107,74,0.1)]" />
        
        {/* Inner Ring - Slower & Subtle */}
        <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-l-copper/40 animate-spin [animation-duration:2s] [animation-direction:reverse]" />
        
        {/* Center dot */}
        <div className="absolute inset-[45%] bg-copper rounded-full blur-[2px] animate-pulse" />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <span className="text-copper font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
          VTeamFit
        </span>
        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
      </div>
    </div>
  )
}

export default LoadingSpinner
