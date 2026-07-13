import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchCases } from '../api/cases.js'
import { clearAll, getRole } from '../api/auth.js'

const STAGE_LABEL = { active: 'Aktīvs', done: 'Pabeigts' }
const STAGE_COLOR = { active: 'bg-brand', done: 'bg-go' }

/* ─── Time-since helper ─────────────────────────────────────── */
function timeSince(isoStr) {
  if (!isoStr) return null
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 60)  return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

/* ─── Case row with health indicators ──────────────────────── */
function CaseRow({ c, onClick }) {
  const h        = c.health          // may be undefined for real API responses
  const syncAgo  = timeSince(c.synced_at)
  const hasBar   = h?.progress != null

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-stretch border-b border-concrete-dim last:border-b-0 hover:bg-concrete active:bg-concrete-dim transition group"
    >
      {/* Stage colour strip */}
      <div className={`w-[3px] shrink-0 ${STAGE_COLOR[c.stage] || 'bg-concrete-dim'}`} />

      <div className="flex-1 px-4 py-3">
        {/* Top row */}
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-sm text-asphalt group-hover:text-rebar transition truncate flex-1">
            {c.name}
          </p>
          <span className="font-mono text-asphalt-soft/50 text-base shrink-0">›</span>
        </div>

        {/* Mini progress bar */}
        {hasBar && (
          <div className="w-full h-[2px] bg-concrete-dim mt-2 mb-2">
            <div
              className={`h-[2px] transition-all ${h.progress >= 100 ? 'bg-go' : 'bg-brand'}`}
              style={{ width: `${Math.min(h.progress, 100)}%` }}
            />
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap mt-1">
          <span className="font-mono text-[10px] text-asphalt-soft tracking-widest uppercase">
            {STAGE_LABEL[c.stage] || c.stage}
          </span>

          {hasBar && (
            <span className={`font-mono text-[10px] ${h.progress >= 100 ? 'text-go' : 'text-asphalt-soft'}`}>
              {h.progress}%
            </span>
          )}

          {h?.docs_total > 0 && (
            <span className={`font-mono text-[10px] ${h.docs_matched === h.docs_total ? 'text-go' : 'text-asphalt-soft'}`}>
              {h.docs_matched}/{h.docs_total} dok.
            </span>
          )}

          {syncAgo && (
            <span className="font-mono text-[10px] text-asphalt-soft/50">
              BIS {syncAgo}
            </span>
          )}
        </div>

        {/* Warning */}
        {h?.warnings > 0 && (
          <p className="font-mono text-[10px] text-caution mt-1">
            ⚠ {h.warnings} poz. bez dokumentiem
          </p>
        )}
      </div>
    </button>
  )
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function CasesList() {
  const [cases,   setCases]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    fetchCases().then((data) => {
      if (!cancelled) { setCases(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  const role = getRole()
  const ROLE_LABEL = { coordinator: 'Koordinators', foreman: 'Priekšnieks', supervisor: 'Uzraugs' }

  function handleLogout() {
    clearAll()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-concrete">
      <Header
        title="LEVIATHAN"
        right={
          <div className="flex items-center gap-3">
            {role && (
              <span className="text-[11px] font-mono text-white/50 tracking-widest uppercase">
                {ROLE_LABEL[role]}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-[11px] font-mono text-white/50 tracking-widests uppercase hover:text-white transition min-h-tap px-2"
            >
              Iziet
            </button>
          </div>
        }
      />

      <div className="px-4 pt-6">
        <div className="section-label mb-4">Mani objekti</div>

        {loading && (
          <p className="font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam objektus…</p>
        )}

        <div className="border border-concrete-dim bg-card">
          {cases.map((c) => (
            <CaseRow
              key={c.id}
              c={c}
              onClick={() => navigate(`/cases/${c.id}`)}
            />
          ))}

          {!loading && cases.length === 0 && (
            <EmptyState
              icon="🏗"
              title="Nav objektu"
              description="Pievienojies uzņēmumam vai izveido pirmo būvobjektu"
              action={role === 'coordinator' ? 'Izveidot objektu →' : undefined}
              onAction={() => navigate('/onboarding')}
            />
          )}
        </div>

        {/* Dev link */}
        <button
          onClick={() => navigate('/materials-demo')}
          className="w-full text-left mt-4 border border-dashed border-concrete-dim px-4 py-3 text-[11px] font-mono text-asphalt-soft tracking-widest uppercase hover:border-rebar hover:text-rebar transition"
        >
          Makets: materiālu saskaņošana →
        </button>
      </div>
    </div>
  )
}
