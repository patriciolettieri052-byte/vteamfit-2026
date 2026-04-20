import Image from 'next/image'
import Link from 'next/link'
import { Exercise } from '@/types'
import IntensityBar from './IntensityBar'

export default function ExerciseCard({ exercise, isCompleted, slugInfo }: { exercise: Exercise, isCompleted: boolean, slugInfo: { week: number, day: number, slug: string } }) {
  // Fallbacks per requirement if sets/reps were absent
  const sets = exercise.sets || 3
  const reps = exercise.reps || '12'

  return (
    <Link 
      // Link to show exercise detail with context
      href={`/dashboard/semana/${slugInfo.week}/dia/${slugInfo.day}/ejercicio/${slugInfo.slug}`} 
      className={`relative w-full flex items-center bg-surface rounded-[1.5rem] p-3 border-2 transition-transform duration-300 hover:scale-[1.02] active:scale-95 ${
        isCompleted 
          ? 'border-copper shadow-[0_0_24px_rgba(255,107,74,0.15)] opacity-80' 
          : 'border-white/5 shadow-xl hover:border-white/10'
      }`}
    >
      {/* PulseFit Style Thumbnail with Video Overlay */}
      <div className="relative w-[100px] h-[100px] rounded-[1rem] overflow-hidden shrink-0 bg-carbon shadow-inner">
        {exercise.thumbnail_url?.includes('.mp4') ? (
          <video
            src={`${exercise.thumbnail_url}#t=0.001`}
            className="w-[100px] h-[100px] object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <Image
            src={exercise.thumbnail_url || '/thumbnails/default.jpg'}
            alt={exercise.name_es}
            fill
            unoptimized={true}
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Info Group */}
      <div className="flex-1 pl-5 pr-2 py-1 flex flex-col justify-center">
        <h3 className="text-lg font-black text-white italic uppercase leading-tight line-clamp-2 pr-1">
          {exercise.name_es}
        </h3>
        
        <div className="flex flex-col gap-1 mt-1">
          {exercise.categoria && exercise.categoria.toLowerCase() !== 'general' && (
            <span className="text-[10px] text-copper/70 uppercase tracking-widest font-bold">
              {exercise.categoria.replace('-', ' ')}
            </span>
          )}
          <p className="text-dim font-bold text-[11px] tracking-widest uppercase">
            {sets} Series × {reps}
          </p>
        </div>
      </div>

      {/* Trailing components block */}
      <div className="shrink-0 flex items-center justify-end pl-2 pr-1">
        <IntensityBar intensity={exercise.intensity as 'high' | 'medium' | 'low'} />
      </div>

      {/* Success completion checkmark overlay */}
      {isCompleted && (
        <div className="absolute -top-2.5 -right-2.5 w-8 h-8 bg-copper rounded-full border-[3px] border-carbon flex items-center justify-center text-white shadow-lg z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}
    </Link>
  )
}
