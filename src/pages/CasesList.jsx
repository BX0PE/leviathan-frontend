import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { fetchCases } from '../api/cases.js'
import { clearAll, getRole } from '../api/auth.js'

const STAGE_LABEL = { active: 'Aktīvs', done: 'Pabeigts' }
const STAGE_COLOR = { active: 'bg-brand', done: 'bg-go' }

export default function CasesList() {
  const [cases, setCases] = useState([])
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
              className="text-[11px] font-mono text-white/50 tracking-widest uppercase hover:text-white transition min-h-tap px-2"
            >
              Iziet
            </button>
          </div>
        }
      />

      <div className="px-4 pt-6">
        {/* Section label */}
        <div className="section-label mb-4">Mani objekti</div>

        {loading && (
          <p className="font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam objektus…</p>
        )}

        {/* Objects list — flat rows, no cards */}
        <div className="border border-concrete-dim bg-card">
          {cases.map((c, i) => (
            <button
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="w-full text-left flex items-stretch gap-0 border-b border-concrete-dim last:border-b-0 hover:bg-concrete active:bg-concrete-dim transition min-h-tap group"
            >
              {/* Status strip */}
              <div className={`w-[3px] shrink-0 ${STAGE_COLOR[c.stage] || 'bg-concrete-dim'}`} />

              {/* Content */}
              <div className="flex items-center gap-4 px-4 py-3 flex-1">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-asphalt group-hover:text-rebar transition">{c.name}</p>
                  <p className="font-mono text-[11px] text-asphalt-soft mt-0.5 tracking-wide">
                    Rīga · {STAGE_LABEL[c.stage] || c.stage}
                  </p>
                </div>
                <span className="font-mono text-asphalt-soft/50 text-lg">›</span>
              </div>
            </button>
          ))}

          {!loading && cases.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="font-mono text-sm text-asphalt-soft tracking-wide">Nav objektu</p>
            </div>
          )}
        </div>

        {/* Demo prototype link */}
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
