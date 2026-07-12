const STEPS = ['Проектировщик', 'Согласование', 'Отправка', 'Получение']

export default function WorkflowStepper({ current }) {
  return (
    <div className="flex items-center px-4 py-3 bg-card border-b border-concrete-dim overflow-x-auto">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center shrink-0">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold ${
                i === current
                  ? 'bg-brand text-white'
                  : i < current
                  ? 'bg-go text-white'
                  : 'bg-concrete-dim text-asphalt-soft'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[11px] font-medium whitespace-nowrap ${i === current ? 'text-brand' : 'text-asphalt-soft'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-8 mx-1 mb-4 ${i < current ? 'bg-go' : 'bg-concrete-dim'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
