/* ─── Reusable empty-state block ───────────────────────────────
   Usage:
     <EmptyState
       icon="📭"
       title="Nav dokumentu"
       description="Augšupielādē PDF ar pogu objekta lapā"
       action="Augšupielādēt"
       onAction={() => navigate(...)}
     />
───────────────────────────────────────────────────────────────── */
export default function EmptyState({ icon = '○', title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center py-14 px-4 text-center">
      {/* Icon box */}
      <div className="w-14 h-14 border border-concrete-dim flex items-center justify-center text-2xl text-asphalt-soft mb-5 select-none">
        {icon}
      </div>

      <h3 className="font-semibold text-sm text-asphalt mb-2">{title}</h3>

      {description && (
        <p className="font-mono text-[11px] text-asphalt-soft tracking-wide leading-relaxed max-w-[220px] mb-6">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={onAction}
          className="bg-brand text-white font-mono text-[11px] tracking-widest uppercase px-6 py-3 hover:bg-brand-dark transition-all duration-150 active:scale-[0.97]"
        >
          {action}
        </button>
      )}
    </div>
  )
}
