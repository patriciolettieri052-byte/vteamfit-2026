'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getExerciseBySlug } from '@/data/gluteos-exercises'
import { useAppStore } from '@/store/appStore'
import VideoPlayer from '@/components/ejercicio/VideoPlayer'
import ExerciseInfo from '@/components/ejercicio/ExerciseInfo'
import SetsRepsDisplay from '@/components/ejercicio/SetsRepsDisplay'
import SessionTimer from '@/components/ejercicio/SessionTimer'
import ExerciseForm from '@/components/ejercicio/ExerciseForm'

export default function EjercicioPage({ params }: { params: Promise<{ week: string, day: string, slug: string }> }) {
  const resolvedParams = use(params)
  const { week, day, slug } = resolvedParams
  const weekNum = parseInt(week, 10)
  const dayNum = parseInt(day, 10)
  
  const { lang, addSessionDuration } = useAppStore()
  const exercise = getExerciseBySlug(slug)

  if (!exercise || isNaN(weekNum) || isNaN(dayNum)) {
    notFound()
  }

  const handleTimeUpdate = (minutes: number) => {
    addSessionDuration(dayNum, minutes)
  }

  return (
    <main className="min-h-screen max-w-lg mx-auto w-full relative selection:bg-copper selection:text-white">
      {/* Back button */}
      <Link 
        href={`/dashboard/semana/${week}/dia/${day}`} 
        className="absolute top-6 left-6 z-50 bg-black/40 backdrop-blur-xl w-14 h-14 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 hover:-translate-x-1 transition-all shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </Link>

      <div className="p-6 flex flex-col gap-8 pt-24">
        <VideoPlayer videoUrl={exercise.video_url} />
        
        <ExerciseInfo exercise={exercise} lang={lang} dayNumber={dayNum} />
        
        <SetsRepsDisplay 
          sets={exercise.sets || 3} 
          reps={exercise.reps || '12'} 
          dayNumber={dayNum} 
          lang={lang} 
        />
        
        <SessionTimer 
          dayNumber={dayNum} 
          onTimeUpdate={handleTimeUpdate} 
          lang={lang} 
        />
        
        <ExerciseForm 
          slug={slug}
          defaultSets={exercise.sets || 3}
          defaultReps={exercise.reps || '12'}
          week={weekNum}
          day={dayNum}
          lang={lang}
        />
      </div>
    </main>
  )
}
