interface StepGeneroProps {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}

export default function StepGenero({ value, onChange, onNext }: StepGeneroProps) {
  const opciones = [
    { value: 'F', label: 'Mujer' },
    { value: 'M', label: 'Hombre' },
    { value: 'O', label: 'Prefiero no decir' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
          Hola 👋
        </h1>
        <p className="text-dim text-sm">
          Contanos un poco sobre vos para personalizar tu experiencia
        </p>
      </div>

      <div>
        <label className="text-dim text-xs uppercase tracking-widest font-bold block mb-3">
          ¿Con qué género te identificás?
        </label>
        <div className="flex flex-col gap-3">
          {opciones.map((op) => (
            <button
              key={op.value}
              onClick={() => onChange(op.value)}
              className={`w-full py-4 px-6 rounded-2xl border-2 text-left font-bold uppercase tracking-wide transition-all active:scale-95 ${
                value === op.value
                  ? 'bg-copper border-copper text-white'
                  : 'bg-surface border-surface text-dim hover:border-dim'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className="w-full bg-copper text-white font-black uppercase tracking-widest py-4 rounded-2xl disabled:opacity-30 active:scale-95 transition-all"
      >
        Continuar
      </button>
    </div>
  )
}
