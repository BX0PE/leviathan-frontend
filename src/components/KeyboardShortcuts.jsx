import { useCallback, useEffect, useState } from 'react'

/* ─── Shortcut definitions ──────────────────────────────────── */
const SHORTCUTS = [
  { keys: 'U',        desc: 'Augšupielādēt failu' },
  { keys: 'F',        desc: 'Meklēt pozīcijas' },
  { keys: 'Enter',    desc: 'Pieņemt AI priekšlikumu' },
  { keys: 'Esc',      desc: 'Atcelt / aizvērt' },
  { keys: 'Ctrl + S', desc: 'Saglabāt melnrakstu' },
  { keys: 'Ctrl + ↵', desc: 'Nosūtīt BIS' },
  { keys: '?',        desc: 'Parādīt šo sarakstu' },
]

function isTyping() {
  const tag = document.activeElement?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/* ─── Global keyboard shortcut handler + help overlay ───────── */
export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  const onKey = useCallback((e) => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (isTyping()) return
    if (e.key === '?') { e.preventDefault(); setOpen((v) => !v) }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onKey])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9998] bg-asphalt/75 flex items-center justify-center px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-card border border-concrete-dim w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-asphalt border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <span className="font-mono text-[11px] text-white/50 tracking-widest uppercase">
            Tastatūras saīsnes
          </span>
          <button
            onClick={() => setOpen(false)}
            className="font-mono text-white/30 hover:text-white transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-concrete-dim">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between px-5 py-3 gap-4">
              <span className="font-mono text-[11px] text-asphalt-soft tracking-wide">{s.desc}</span>
              <kbd className="font-mono text-[11px] text-asphalt bg-concrete border border-concrete-dim px-2 py-0.5 whitespace-nowrap shrink-0">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-concrete-dim bg-concrete">
          <p className="font-mono text-[10px] text-asphalt-soft/60 tracking-wide text-center">
            Nospied ? vai Esc, lai aizvērtu
          </p>
        </div>
      </div>
    </div>
  )
}
