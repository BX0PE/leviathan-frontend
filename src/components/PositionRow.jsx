import TapeProgress from './TapeProgress.jsx'

export default function PositionRow({ position, value, onChange }) {
  const { name, unit, quantity_planned, quantity_used } = position
  return (
    <div className="py-4 border-b border-concrete-dim last:border-b-0">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <p className="font-body font-semibold text-base leading-snug">{name}</p>
      </div>
      <p className="font-mono text-sm text-asphalt-soft mb-2">
        план {quantity_planned} {unit} · сделано {quantity_used} {unit}
      </p>
      <TapeProgress used={quantity_used} planned={quantity_planned} />
      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm font-medium text-asphalt-soft shrink-0">Сегодня:</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          placeholder="0"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-h-tap rounded-card border-2 border-asphalt-soft bg-white px-4 text-lg font-mono font-semibold text-right focus:border-rebar"
        />
        <span className="font-mono text-sm text-asphalt-soft w-8">{unit}</span>
      </div>
    </div>
  )
}
