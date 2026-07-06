interface StepMetricasProps {
  peso: string
  altura: string
  edad: string
  onPesoChange: (v: string) => void
  onAlturaChange: (v: string) => void
  onEdadChange: (v: string) => void
  onBack: () => void
  onComplete: () => void
  loading: boolean
  error: string
}

export default function StepMetricas({
  peso, altura, edad,
  onPesoChange, onAlturaChange, onEdadChange,
  onBack, onComplete, loading, error
}: StepMetricasProps) {

  const campos = [
    {
      label: 'Peso (kg)',
      value: peso,
      onChange: onPesoChange,
      placeholder: 'Ej: 65',
      type: 'number',
      min: '30', max: '200'
    },
    {
      label: 'Altura (cm)',
      value: altura,
      onChange: onAlturaChange,
      placeholder: 'Ej: 165',
      type: 'number',
      min: '100', max: '250'
    },
    {
      label: 'Edad',
      value: edad,
      onChange: onEdadChange,
      placeholder: 'Ej: 28',
      type: 'number',
      min: '16', max: '99'
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
          Tus métricas
        </h1>
        <p className="text-dim text-sm">
          Estos datos nos ayudan a personalizar tu plan. Puedes actualizarlos después.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {campos.map((campo) => (
          <div key={campo.label} className="flex flex-col gap-1">
            <label className="text-dim text-xs uppercase tracking-widest font-bold">
              {campo.label}
            </label>
            <input
              type={campo.type}
              value={campo.value}
              onChange={e => campo.onChange(e.target.value)}
              placeholder={campo.placeholder}
              min={campo.min}
              max={campo.max}
              className="bg-surface border border-dim/40 rounded-2xl px-4 py-4 text-white text-lg placeholder:text-dim/50 focus:outline-none focus:border-copper transition-colors"
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <p className="text-dim text-xs text-center">
        Todos los campos son opcionales — puedes completarlos después
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-surface text-dim font-bold uppercase tracking-widest py-4 rounded-2xl active:scale-95 transition-all"
        >
          Atrás
        </button>
        <button
          onClick={onComplete}
          disabled={loading}
          className="flex-2 flex-grow bg-copper text-white font-black uppercase tracking-widest py-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-all"
        >
          {loading ? 'Guardando...' : '¡Empezar!'}
        </button>
      </div>
    </div>
  )
}
