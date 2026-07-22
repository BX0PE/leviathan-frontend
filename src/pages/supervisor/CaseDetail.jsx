import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { fetchSummary } from '../../api/coordinator.js'
import { client } from '../../api/client.js'

function ProgressBar({ percent }) {
  const color = percent >= 100 ? 'bg-go' : percent > 0 ? 'bg-brand' : 'bg-white/10'
  return (
    <div className="w-full bg-white/10 h-[4px] mt-2">
      <div className={`h-[4px] ${color} transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  )
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('lv-LV', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  })
}

function groupByDate(entries) {
  const map = new Map()
  for (const e of entries) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date).push(e)
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
}

export default function SupervisorCaseDetail() {
  const { id } = useParams()
  const [summary,  setSummary]  = useState(null)
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchSummary(id),
      client.get(`/cases/${id}/entries`).then((r) => r.data).catch(() => []),
    ]).then(([sum, ents]) => {
      if (cancelled) return
      setSummary(sum)
      setEntries(ents)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-blueprint">
      <Header title="…" onBack />
      <div className="px-4 pt-5 flex flex-col gap-4">
        <div className="bg-white/5 border border-white/10 p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-white/10 mb-3" />
          <div className="h-1.5 w-full bg-white/10" />
        </div>
        <div className="bg-white/5 border border-white/10 p-4 animate-pulse">
          <div className="h-3 w-1/2 bg-white/10 mb-2" />
          <div className="h-3 w-1/3 bg-white/10" />
        </div>
      </div>
    </div>
  )

  const caseName = summary?.case?.name || 'Objekts'
  const progress = summary?.progress || {}
  const groups   = summary?.groups   || []
  const entryGroups = groupByDate(entries)

  const totalEntries = entries.length
  const syncedEntries = entries.filter((e) => e.synced).length
  const pendingEntries = totalEntries - syncedEntries

  return (
    <div className="min-h-screen bg-blueprint pb-10">
      <Header title={caseName} onBack />

      {/* Status bar */}
      <div className="bg-asphalt px-4 py-2 flex items-center gap-4">
        <span className="font-mono text-[11px] text-white/40 tracking-widests uppercase">Uzraudzība</span>
        {pendingEntries > 0 && (
          <span className="font-mono text-[11px] text-caution tracking-wide">
            ⏳ {pendingEntries} gaida BIS
          </span>
        )}
        {pendingEntries === 0 && totalEntries > 0 && (
          <span className="font-mono text-[11px] text-go tracking-wide">
            ✓ Visi sinhronizēti
          </span>
        )}
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">

        {/* ── Progress overview ── */}
        <div className="bg-white/5 border border-white/10">
          <div className="px-4 pt-4 pb-1 border-b border-white/10 flex justify-between items-center">
            <span className="font-mono text-[11px] text-white/40 tracking-widests uppercase">Kopējais progress</span>
            <span className="font-mono font-bold text-2xl text-brand">{progress.overall_percent ?? 0}%</span>
          </div>
          <div className="px-4 py-3">
            <ProgressBar percent={progress.overall_percent ?? 0} />
            <div className="flex gap-5 mt-3 text-[11px] font-mono text-white/40 tracking-wide">
              <span>KOPĀ <b className="text-white/70">{progress.total_positions ?? 0}</b></span>
              <span>SĀKTAS <b className="text-white/70">{progress.started ?? 0}</b></span>
              <span>PABEIGTAS <b className="text-white/70">{progress.completed ?? 0}</b></span>
            </div>
          </div>
        </div>

        {/* ── Per-section progress ── */}
        {groups.length > 0 && (
          <div className="bg-white/5 border border-white/10">
            <div className="px-4 py-3 border-b border-white/10">
              <span className="font-mono text-[11px] text-white/40 tracking-widests uppercase">Pa sadaļām</span>
            </div>
            <div className="divide-y divide-white/10">
              {groups.map((g) => (
                <div key={g.name} className="px-4 py-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-white/80 truncate pr-4">{g.name}</span>
                    <span className="font-mono text-sm font-semibold text-white/50 shrink-0">{g.percent}%</span>
                  </div>
                  <ProgressBar percent={g.percent} />
                  <p className="font-mono text-[11px] text-white/30 mt-1.5 tracking-wide">
                    {g.used} / {g.planned} · {g.positions_count} poz.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Darbu ieraksti ── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[11px] text-white/40 tracking-widests uppercase">Darbu ieraksti</span>
            {totalEntries > 0 && (
              <span className="font-mono text-[10px] text-white/20">{totalEntries} kopā</span>
            )}
          </div>

          {entries.length === 0 && (
            <div className="bg-white/5 border border-white/10">
              <EmptyState
                icon="○"
                title="Nav ierakstu"
                description="Priekšnieks vēl nav iesniedzis darbu apjomus"
              />
            </div>
          )}

          {entryGroups.map(([date, items]) => {
            const first = items[0]
            const allSynced = items.every((e) => e.synced)
            const timeLabel = first.time_from
              ? first.time_to ? `${first.time_from}–${first.time_to}` : first.time_from
              : null

            return (
              <div key={date} className="mb-4">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[11px] text-white/50 tracking-widest uppercase whitespace-nowrap">
                    {fmtDate(date)}
                  </span>
                  {timeLabel && (
                    <span className="font-mono text-[10px] text-white/30">· {timeLabel}</span>
                  )}
                  {first.employees && (
                    <span className="font-mono text-[10px] text-white/30">· 👷{first.employees}</span>
                  )}
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className={`font-mono text-[10px] shrink-0 ${allSynced ? 'text-go' : 'text-caution'}`}>
                    {allSynced ? '✓ BIS' : '⏳ rinda'}
                  </span>
                </div>

                {/* Description */}
                {first.description && first.description !== 'Būvdarbi' && (
                  <p className="font-mono text-[11px] text-white/40 leading-relaxed mb-2 pl-1 italic">
                    {first.description}
                  </p>
                )}

                {/* Entries */}
                <div className="bg-white/5 border border-white/10">
                  {items.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-4 py-3 border-b border-white/10 last:border-b-0"
                    >
                      <div className={`w-[2px] h-7 shrink-0 ${e.synced ? 'bg-go' : 'bg-caution'}`} />
                      <p className="text-sm text-white/70 flex-1 truncate min-w-0">{e.position_name}</p>
                      <p className="font-mono text-sm font-semibold text-white/80 shrink-0">
                        {e.quantity_used} <span className="font-normal text-white/30">{e.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── eParaksts placeholder ── */}
        {entries.some((e) => e.synced && !e.signed) && (
          <div className="bg-white/5 border border-white/10 px-4 py-5 text-center">
            <p className="font-mono text-[11px] text-white/40 tracking-widests uppercase mb-2">Nodot apstiprināšanai</p>
            <p className="font-mono text-[11px] text-white/20 tracking-wide mb-4 leading-relaxed">
              eParaksts integrācija — drīzumā. Ierakstus varēs parakstīt digitāli un nosūtīt uz BIS apstiprināšanai.
            </p>
            <div className="border border-white/10 py-2 font-mono text-[11px] text-white/20 tracking-widests uppercase">
              Drīzumā ›
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
