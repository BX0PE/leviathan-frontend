import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import AuditTrail from '../../components/AuditTrail.jsx'
import { fetchSummary } from '../../api/coordinator.js'
import { deleteCase } from '../../api/cases.js'

function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-concrete-dim h-[6px] mt-2">
      <div
        className="h-[6px] bg-brand transition-all"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  )
}

export default function CoordinatorCaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchSummary(id)
      .then((data) => { if (!cancelled) { setSummary(data); setLoading(false) } })
      .catch((e) => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-concrete">
      <Header title="…" onBack />
      <p className="px-4 pt-6 font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam pārskatu…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Kļūda" onBack />
      <p className="px-4 pt-6 text-danger font-mono text-sm">{error}</p>
    </div>
  )

  const { case: c, progress, pending_sync, documents, groups, recent_entries } = summary

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title={c.name} onBack />

      <div className="px-4 pt-5 flex flex-col gap-5">

        {/* ── Kopējais progress ── */}
        <div className="bg-card border border-concrete-dim">
          <div className="px-4 pt-4 pb-1 border-b border-concrete-dim flex justify-between items-center">
            <div className="section-label">Kopējais progress</div>
            <span className="font-mono font-bold text-2xl text-brand">{progress.overall_percent}%</span>
          </div>
          <div className="px-4 py-3">
            <ProgressBar percent={progress.overall_percent} />
            <div className="flex gap-5 mt-3 text-[11px] font-mono text-asphalt-soft tracking-wide">
              <span>KOPĀ <b className="text-asphalt">{progress.total_positions}</b></span>
              <span>SĀKTAS <b className="text-asphalt">{progress.started}</b></span>
              <span>PABEIGTAS <b className="text-asphalt">{progress.completed}</b></span>
            </div>
          </div>
        </div>

        {/* ── Statusi — 2 metrikas ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-concrete-dim px-4 py-3 text-center">
            <p className="font-mono font-bold text-3xl text-caution">{pending_sync}</p>
            <p className="text-[11px] font-mono text-asphalt-soft tracking-widest uppercase mt-1">Gaida BIS</p>
          </div>
          <div className="bg-card border border-concrete-dim px-4 py-3 text-center">
            <p className="font-mono font-bold text-3xl text-brand">
              {documents.matched}
              <span className="text-asphalt-soft font-normal text-lg">/{documents.total}</span>
            </p>
            <p className="text-[11px] font-mono text-asphalt-soft tracking-widest uppercase mt-1">Dokumenti</p>
          </div>
        </div>

        {/* ── Progress pa sadaļām ── */}
        {groups.length > 0 && (
          <div className="bg-card border border-concrete-dim">
            <div className="px-4 py-3 border-b border-concrete-dim">
              <div className="section-label">Pa sadaļām</div>
            </div>
            <div className="divide-y divide-concrete-dim">
              {groups.map((g) => (
                <div key={g.name} className="px-4 py-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-asphalt">{g.name}</span>
                    <span className="font-mono text-sm font-semibold text-asphalt-soft">{g.percent}%</span>
                  </div>
                  <ProgressBar percent={g.percent} />
                  <p className="font-mono text-[11px] text-asphalt-soft mt-1.5 tracking-wide">
                    {g.used} / {g.planned} · {g.positions_count} poz.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Darbības ── */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(`/cases/${id}/import-estimate`)}
            className="bg-brand text-white px-4 py-4 font-semibold text-sm text-left flex items-center gap-4 min-h-tap hover:bg-brand-dark active:bg-brand-dark transition"
          >
            <span className="text-xl shrink-0">📊</span>
            <div>
              <p className="tracking-wide">Augšupielādēt tāmi</p>
              <p className="font-mono font-normal opacity-60 text-[11px] tracking-widest uppercase mt-0.5">Excel LBN 501-17</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/cases/${id}/import-documents`)}
            className="bg-card border border-concrete-dim px-4 py-4 font-semibold text-sm text-left flex items-center gap-4 min-h-tap hover:bg-concrete active:bg-concrete-dim transition"
          >
            <span className="text-xl shrink-0">📄</span>
            <div>
              <p className="text-asphalt tracking-wide">Augšupielādēt dokumentus</p>
              <p className="font-mono font-normal text-asphalt-soft text-[11px] tracking-widest uppercase mt-0.5">PDF pases un sertifikāti</p>
            </div>
          </button>

          {documents.total > 0 && (
            <button
              onClick={() => navigate(`/cases/${id}/documents`)}
              className="bg-card border border-concrete-dim px-4 py-4 font-semibold text-sm text-left flex items-center gap-4 min-h-tap hover:bg-concrete active:bg-concrete-dim transition"
            >
              <span className="text-xl shrink-0">🗂</span>
              <div>
                <p className="text-asphalt tracking-wide">Objekta dokumenti</p>
                <p className={`font-mono font-normal text-[11px] tracking-widest uppercase mt-0.5 ${documents.unmatched > 0 ? 'text-caution' : 'text-asphalt-soft'}`}>
                  {documents.unmatched > 0
                    ? `⚠ ${documents.unmatched} nav piesaistīti`
                    : `✓ Visi piesaistīti (${documents.total})`}
                </p>
              </div>
            </button>
          )}

          <button
            onClick={() => navigate(`/cases/${id}/link-materials`)}
            className="bg-card border border-concrete-dim px-4 py-4 font-semibold text-sm text-left flex items-center gap-4 min-h-tap hover:bg-concrete active:bg-concrete-dim transition"
          >
            <span className="text-xl shrink-0">🔗</span>
            <div>
              <p className="text-asphalt tracking-wide">Piesaistīt materiālus</p>
              <p className="font-mono font-normal text-asphalt-soft text-[11px] tracking-widest uppercase mt-0.5">Tāmes pozīcijas → kartītes</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/materials')}
            className="bg-card border border-concrete-dim px-4 py-4 font-semibold text-sm text-left flex items-center gap-4 min-h-tap hover:bg-concrete active:bg-concrete-dim transition"
          >
            <span className="text-xl shrink-0">🧱</span>
            <div>
              <p className="text-asphalt tracking-wide">Materiālu bibliotēka</p>
              <p className="font-mono font-normal text-asphalt-soft text-[11px] tracking-widest uppercase mt-0.5">DoP deklarācijas · kartītes</p>
            </div>
          </button>
        </div>

        {/* ── Jaunākie ieraksti ── */}
        {recent_entries.length > 0 && (
          <div className="bg-card border border-concrete-dim">
            <div className="px-4 py-3 border-b border-concrete-dim">
              <div className="section-label">Jaunākie ieraksti</div>
            </div>
            <div className="divide-y divide-concrete-dim">
              {recent_entries.map((e) => (
                <div key={e.id} className="flex justify-between items-center px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-asphalt">{e.position_name}</p>
                    <p className="font-mono text-[11px] text-asphalt-soft tracking-wide mt-0.5">{e.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">{e.quantity_used} {e.unit}</p>
                    <span className={`font-mono text-[11px] tracking-widest ${e.synced ? 'text-go' : 'text-caution'}`}>
                      {e.synced ? '✓ BIS' : '⏳ rinda'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Darbību žurnāls ── */}
        <AuditTrail caseId={id} />

        {/* ── Dzēst objektu (опасная зона) ── */}
        <div className="border-t border-concrete-dim pt-4 mt-2">
          {!deleteConfirm ? (
            <button
              onClick={() => { setDeleteConfirm(true); setDeleteError(null) }}
              className="w-full font-mono text-[11px] text-asphalt-soft/50 tracking-widest uppercase hover:text-danger transition py-2"
            >
              Dzēst objektu
            </button>
          ) : (
            <div className="bg-card border border-danger/40 px-4 py-4">
              <p className="font-mono text-[11px] text-danger tracking-wide mb-1">
                Dzēst objektu "{c.name}"?
              </p>
              <p className="font-mono text-[10px] text-asphalt-soft mb-3">
                Tiks dzēsti visi ieraksti un dokumenti. Datus, kas jau nosūtīti uz BIS, dzēst nevar.
              </p>
              {deleteError && (
                <p className="font-mono text-[11px] text-danger mb-3">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setDeleting(true)
                    setDeleteError(null)
                    try {
                      await deleteCase(id)
                      navigate('/cases', { replace: true })
                    } catch (e) {
                      const msg = e?.response?.data?.detail || e.message || 'Kļūda'
                      setDeleteError(msg)
                      setDeleting(false)
                    }
                  }}
                  disabled={deleting}
                  className="flex-1 bg-danger text-white font-mono text-[11px] tracking-widest uppercase py-2 hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? 'Dzēš…' : '✓ Dzēst'}
                </button>
                <button
                  onClick={() => { setDeleteConfirm(false); setDeleteError(null) }}
                  className="flex-1 border border-concrete-dim font-mono text-[11px] text-asphalt-soft tracking-widest uppercase py-2 hover:bg-concrete transition"
                >
                  Atcelt
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
