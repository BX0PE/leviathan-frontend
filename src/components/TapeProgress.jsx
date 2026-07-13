export default function TapeProgress({ used, planned }) {
  const pct = planned > 0 ? Math.min(100, Math.round((used / planned) * 100)) : 0
  const color = pct >= 100 ? 'bg-go' : pct > 0 ? 'bg-brand' : 'bg-concrete-dim'
  return (
    <div className="flex items-center gap-3">
      <div className="tape-track flex-1">
        <div className={`tape-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[11px] font-semibold text-asphalt-soft w-9 text-right tracking-wide">
        {pct}%
      </span>
    </div>
  )
}
