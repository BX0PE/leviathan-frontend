import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import { fetchSummary } from '../../api/coordinator.js'

function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-concrete-dim rounded-full h-2 mt-1">
      <div
        className="h-2 rounded-full bg-brand transition-all"
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
      <p className="px-4 pt-6 text-asphalt-soft">Ielādējam pārskatu…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Kļūda" onBack />
      <p className="px-4 pt-6 text-danger">{error}</p>
    </div>
  )

  const { case: c, progress, pending_sync, documents, groups, recent_entries } = summary

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title={c.name} onBack />

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* ── Kopējais progress ── */}
        <div className="bg-card rounded-card shadow-sm px-4 py-4">
          <div className="flex justify-between items-baseline mb-1">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-rebar">
              Kopējais progress
            </h2>
            <span className="font-mono font-bold text-xl text-brand">{progress.overall_percent}%</span>
          </div>
          <ProgressBar percent={progress.overall_percent} />
          <div className="flex gap-4 mt-3 text-xs text-asphalt-soft">
            <span>Pozīciju kopā: <b className="text-asphalt">{progress.total_positions}</b></span>
            <span>Sāktas: <b className="text-asphalt">{progress.started}</b></span>
            <span>Pabeigtas: <b className="text-asphalt">{progress.completed}</b></span>
          </div>
        </div>

        {/* ── Statusi ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-card shadow-sm px-4 py-3 text-center">
            <p className="text-2xl font-bold text-caution">{pending_sync}</p>
            <p className="text-xs text-asphalt-soft mt-1">Gaida BIS</p>
          </div>
          <div className="bg-card rounded-card shadow-sm px-4 py-3 text-center">
            <p className="text-2xl font-bold text-brand">{documents.matched}<span className="text-asphalt-soft font-normal text-sm">/{documents.total}</span></p>
            <p className="text-xs text-asphalt-soft mt-1">Dokumenti piesaistīti</p>
          </div>
        </div>

        {/* ── Progress pa sadaļām ── */}
        {groups.length > 0 && (
          <div className="bg-card rounded-card shadow-sm px-4 py-4">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-rebar mb-3">
              Pa sadaļām
            </h2>
            <div className="flex flex-col gap-3">
              {groups.map((g) => (
                <div key={g.name}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-asphalt">{g.name}</span>
                    <span className="font-mono text-asphalt-soft">{g.percent}%</span>
                  </div>
                  <ProgressBar percent={g.percent} />
                  <p className="text-xs text-asphalt-soft mt-0.5">
                    {g.used} / {g.planned} · {g.positions_count} pozīcijas
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Koordinatora darbības ── */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(`/cases/${id}/import-estimate`)}
            className="bg-brand text-white rounded-card px-4 py-3 font-semibold text-sm text-left flex items-center gap-3 min-h-tap"
          >
            <span className="text-xl">📊</span>
            <div>
              <p>Augšupielādēt tāmi</p>
              <p className="font-normal opacity-75 text-xs">Excel LBN 501-17</p>
            </div>
          </button>
          <button
            onClick={() => navigate(`/cases/${id}/import-documents`)}
            className="bg-card border border-concrete-dim rounded-card px-4 py-3 font-semibold text-sm text-left flex items-center gap-3 min-h-tap"
          >
            <span className="text-xl">📄</span>
            <div>
              <p>Augšupielādēt dokumentus</p>
              <p className="font-normal text-asphalt-soft text-xs">PDF pases un sertifikāti</p>
            </div>
          </button>
          {documents.total > 0 && (
            <button
              onClick={() => navigate(`/cases/${id}/documents`)}
              className="bg-card border border-concrete-dim rounded-card px-4 py-3 font-semibold text-sm text-left flex items-center gap-3 min-h-tap"
            >
              <span className="text-xl">🗂</span>
              <div>
                <p>Objekta dokumenti</p>
                <p className="font-normal text-asphalt-soft text-xs">
                  {documents.unmatched > 0
                    ? `${documents.unmatched} nav piesaistīti — nepieciešama uzmanība`
                    : `${documents.total} dokumenti, visi piesaistīti`}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* ── Jaunākie ieraksti ── */}
        {recent_entries.length > 0 && (
          <div className="bg-card rounded-card shadow-sm px-4 py-4">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-rebar mb-3">
              Jaunākie ieraksti
            </h2>
            <div className="flex flex-col gap-2">
              {recent_entries.map((e) => (
                <div key={e.id} className="flex justify-between items-center py-1 border-b border-concrete-dim last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-asphalt">{e.position_name}</p>
                    <p className="text-xs text-asphalt-soft">{e.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">{e.quantity_used} {e.unit}</p>
                    <span className={`text-xs ${e.synced ? 'text-go' : 'text-caution'}`}>
                      {e.synced ? '✓ BIS' : '⏳ rinda'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
