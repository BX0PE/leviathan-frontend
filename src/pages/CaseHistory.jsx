import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchCases } from '../api/cases.js'
import { client } from '../api/client.js'

/* ─── Helpers ───────────────────────────────────────────────── */
function fmtDate(isoDate) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('lv-LV', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// Group flat entries array by date → [[date, [entries]], ...]  desc
function groupByDate(entries) {
  const map = new Map()
  for (const e of entries) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date).push(e)
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function CaseHistory() {
  const { id } = useParams()
  const [caseName, setCaseName] = useState('')
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchCases(),
      client.get(`/cases/${id}/entries`).then((r) => r.data).catch(() => []),
    ]).then(([cases, data]) => {
      if (cancelled) return
      const c = cases.find((x) => String(x.id) === String(id))
      setCaseName(c?.name || 'Objekts')
      setEntries(data)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  const groups = groupByDate(entries)

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title={caseName || '…'} onBack />

      {/* Label bar */}
      <div className="bg-asphalt px-4 py-2">
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">
          Ierakstu vēsture
        </span>
      </div>

      <div className="px-4 pt-5">
        <div className="section-label mb-4">Nosūtītie ieraksti</div>

        {loading && (
          <p className="font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam…</p>
        )}

        {!loading && groups.length === 0 && (
          <div className="bg-card border border-concrete-dim">
            <EmptyState
              icon="○"
              title="Nav nosūtītu ierakstu"
              description="Ievadītie ikdienas darbu apjomi parādīsies šeit pēc nosūtīšanas"
            />
          </div>
        )}

        {groups.map(([date, items]) => {
          const first = items[0]
          const timeLabel = first.time_from
            ? first.time_to ? `${first.time_from}–${first.time_to}` : first.time_from
            : null

          return (
            <div key={date} className="mb-5">
              {/* Date divider */}
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[1px] w-3 bg-concrete-dim shrink-0" />
                <span className="font-mono text-[10px] text-asphalt-soft tracking-widests uppercase whitespace-nowrap">
                  {fmtDate(date)}
                </span>
                {timeLabel && (
                  <span className="font-mono text-[10px] text-asphalt-soft/60">· {timeLabel}</span>
                )}
                {first.employees && (
                  <span className="font-mono text-[10px] text-asphalt-soft/60">· 👷{first.employees}</span>
                )}
                <div className="h-[1px] flex-1 bg-concrete-dim" />
                <span className="font-mono text-[10px] text-asphalt-soft/50 shrink-0">
                  {items.length} poz.
                </span>
              </div>

              {/* Description */}
              {first.description && first.description !== 'Būvdarbi' && (
                <p className="font-mono text-[11px] text-asphalt-soft leading-relaxed mb-2 pl-1">
                  {first.description}
                </p>
              )}

              {/* Entry rows */}
              <div className="bg-card border border-concrete-dim">
                {items.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3 border-b border-concrete-dim last:border-b-0"
                  >
                    {/* Sync indicator strip */}
                    <div className={`w-[2px] h-8 shrink-0 ${e.synced ? 'bg-go' : 'bg-caution'}`} />

                    <p className="text-sm font-medium text-asphalt flex-1 truncate min-w-0">
                      {e.position_name}
                    </p>

                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-semibold text-asphalt">
                        {e.quantity_used} <span className="font-normal text-asphalt-soft">{e.unit}</span>
                      </p>
                      <span className={`font-mono text-[10px] tracking-widest ${e.synced ? 'text-go' : 'text-caution'}`}>
                        {e.synced ? '✓ BIS' : '⏳ rinda'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
