import TapeProgress from './TapeProgress.jsx'

export default function PositionRow({ position, value, onChange }) {
  const { name, unit, quantity_planned, quantity_used } = position
  return (
    <div className="py-3 border-b border-concrete-dim last:border-b-0">
      <p className="font-semibold text-sm text-asphalt leading-snug mb-1">{name}</p>
      <p className="font-mono text-[11px] text-asphalt-soft tracking-wide mb-2">
        plāns {quantity_planned} {unit} · izdarīts {quantity_used} {unit}
      </p>
      <TapeProgress used={quantity_used} planned={quantity_planned} />
      <div className="mt-3 flex items-center gap-3">
        <label className="text-[11px] font-mono text-asphalt-soft tracking-widest uppercase shrink-0">Šodien</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          placeholder="0"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-h-[44px] border-2 border-concrete-dim bg-white px-4 text-lg font-mono font-semibold text-right focus:border-brand focus:outline-none transition-colors"
        />
        <span className="font-mono text-sm text-asphalt-soft w-8 shrink-0">{unit}</span>
      </div>
    </div>
  )
}
