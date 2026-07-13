import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import PositionRow from '../components/PositionRow.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchCases, fetchPositions } from '../api/cases.js'

function today() {
  return new Date().toLocaleDateString('lv-LV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseName, setCaseName] = useState('')
  const [positions, setPositions] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchCases(), fetchPositions(id)]).then(([cases, pos]) => {
      if (cancelled) return
      const c = cases.find((x) => String(x.id) === String(id))
      setCaseName(c ? c.name : 'Objekts')
      setPositions(pos)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  const groups = useMemo(() => {
    const map = new Map()
    for (const p of positions) {
      if (!map.has(p.group)) map.set(p.group, [])
      map.get(p.group).push(p)
    }
    return Array.from(map.entries())
  }, [positions])

  function setValue(positionId, raw) {
    setValues((prev) => ({ ...prev, [positionId]: raw }))
  }

  const filledCount = Object.values(values).filter((v) => v !== '' && v !== undefined).length

  function handleSubmit() {
    const items = positions
      .filter((p) => values[p.id] !== undefined && values[p.id] !== '')
      .map((p) => ({ position_id: p.id, quantity: Number(values[p.id]), name: p.name, unit: p.unit }))
    navigate(`/cases/${id}/confirm`, { state: { caseId: Number(id), caseName, items } })
  }

  return (
    <div className="min-h-screen bg-concrete pb-28">
      <Header title={caseName || '…'} onBack={true} />

      {/* Date bar */}
      <div className="bg-asphalt px-4 py-2 flex items-center gap-3">
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">Šodien</span>
        <span className="font-mono text-[11px] text-white/70 tracking-wide">{today()}</span>
        {filledCount > 0 && (
          <span className="font-mono text-[11px] text-brand tracking-wide">
            {filledCount} poz. aizpildītas
          </span>
        )}
        <button
          onClick={() => navigate(`/cases/${id}/history`)}
          className="ml-auto font-mono text-[10px] text-white/30 tracking-widest uppercase hover:text-white/60 transition"
        >
          Vēsture ›
        </button>
      </div>

      <div className="px-4 pt-4">
        {loading && (
          <p className="font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam pozīcijas…</p>
        )}

        {!loading && groups.length === 0 && (
          <div className="bg-card border border-concrete-dim">
            <EmptyState
              icon="📋"
              title="Nav pozīciju"
              description="Koordinatoram jāaugšupielādē tāme, lai šeit parādītos darbu saraksts"
            />
          </div>
        )}

        {groups.map(([groupName, items]) => (
          <div key={groupName} className="bg-card border border-concrete-dim mb-3">
            {/* Group header */}
            <div className="px-4 py-2 border-b border-concrete-dim bg-concrete">
              <div className="section-label">{groupName}</div>
            </div>
            <div className="px-4">
              {items.map((p) => (
                <PositionRow
                  key={p.id}
                  position={p}
                  value={values[p.id]}
                  onChange={(v) => setValue(p.id, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-concrete-dim px-4 py-3">
        <Button variant="primary" onClick={handleSubmit} disabled={filledCount === 0}>
          Nosūtīt uz BIS
        </Button>
      </div>
    </div>
  )
}
