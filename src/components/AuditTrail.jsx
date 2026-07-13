import { useEffect, useState } from 'react'
import { client } from '../api/client.js'

/* ─── Action catalogue ──────────────────────────────────────── */
const META = {
  estimate_uploaded:   { icon: '📊', color: 'text-brand',        label: 'Tāme augšupielādēta' },
  documents_imported:  { icon: '📄', color: 'text-rebar',        label: 'Dokumenti pievienoti' },
  document_linked:     { icon: '🔗', color: 'text-rebar',        label: 'Dokuments piesaistīts' },
  entries_submitted:   { icon: '↑',  color: 'text-asphalt-soft', label: 'Ieraksti nosūtīti BIS' },
  bis_status_updated:  { icon: '✓',  color: 'text-go',           label: 'BIS statuss atjaunots' },
  case_created:        { icon: '+',  color: 'text-asphalt-soft', label: 'Objekts izveidots' },
}

function fmtTs(iso) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('lv-LV', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    '  ' +
    d.toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' })
  )
}

/* ─── Component ─────────────────────────────────────────────── */
export default function AuditTrail({ caseId }) {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [empty,   setEmpty]   = useState(false)

  useEffect(() => {
    let cancelled = false
    client.get(`/cases/${caseId}/audit`)
      .then((r) => {
        if (cancelled) return
        setEvents(r.data)
        setEmpty(r.data.length === 0)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) { setEmpty(true); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [caseId])

  if (loading) return null

  return (
    <div className="bg-card border border-concrete-dim">
      <div className="px-4 py-3 border-b border-concrete-dim">
        <div className="section-label">Darbību žurnāls</div>
      </div>

      {empty ? (
        <div className="px-4 py-6 text-center">
          <p className="font-mono text-[11px] text-asphalt-soft tracking-wide">
            Nav ierakstu · Parādīsies, kad tiks veiktas darbības
          </p>
        </div>
      ) : (
        <div className="divide-y divide-concrete-dim">
          {events.map((ev) => {
            const m = META[ev.action] || { icon: '·', color: 'text-asphalt-soft', label: ev.action }
            return (
              <div key={ev.id} className="flex items-start gap-3 px-4 py-3">
                {/* Icon column */}
                <span className={`font-mono font-bold text-sm w-5 text-center shrink-0 mt-0.5 ${m.color}`}>
                  {m.icon}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[12px] text-asphalt leading-snug">
                    {m.label}
                    {ev.detail && (
                      <span className="text-asphalt-soft"> · {ev.detail}</span>
                    )}
                  </p>
                  <p className="font-mono text-[10px] text-asphalt-soft tracking-wide mt-0.5">
                    {fmtTs(ev.ts)} · {ev.actor}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
