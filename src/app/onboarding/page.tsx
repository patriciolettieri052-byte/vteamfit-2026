'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import StepGenero from '@/components/onboarding/StepGenero'
import StepMetricas from '@/components/onboarding/StepMetricas'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [genero, setGenero] = useState('')
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [edad, setEdad] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleComplete() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        gender: genero,
        weight_kg: parseFloat(peso) || null,
        height_cm: parseFloat(altura) || null,
        age: parseInt(edad) || null,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Error al guardar tus datos. Intentá de nuevo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen bg-carbon flex flex-col items-center justify-center px-6 py-12"
      style={{
        backgroundImage: "url('/images/carbon-texture-v4.webp')",
        backgroundRepeat: 'repeat',
        backgroundSize: '500px'
      }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/images/logo.svg" alt="VTeamFit" width={138} height={47} />
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-copper' : 'bg-surface'}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-copper' : 'bg-surface'}`} />
        </div>

        {step === 1 && (
          <StepGenero
            value={genero}
            onChange={setGenero}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepMetricas
            peso={peso}
            altura={altura}
            edad={edad}
            onPesoChange={setPeso}
            onAlturaChange={setAltura}
            onEdadChange={setEdad}
            onBack={() => setStep(1)}
            onComplete={handleComplete}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  )
}
