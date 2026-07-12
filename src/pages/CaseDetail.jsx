import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import PositionRow from '../components/PositionRow.jsx'
import Button from '../components/Button.jsx'
import { fetchCases, fetchPositions } from '../api/cases.js'

function today() {
  return new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
      setCaseName(c ? c.name : 'Объект')
      setPositions(pos)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
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

  // Only fields the foreman actually typed something into get sent —
  // an empty field means "nothing to report here today", not zero.
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
      <div className="px-4 pt-4">
        <p className="font-mono text-sm text-asphalt-soft mb-4">📅 Сегодня: {today()}</p>

        {loading && <p className="text-asphalt-soft">Загружаем позиции…</p>}

        {groups.map(([groupName, items]) => (
          <section key={groupName} className="bg-card rounded-card shadow-sm mb-4 px-4 py-3">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-rebar mb-1">
              {groupName}
            </h2>
            <div>
              {items.map((p) => (
                <PositionRow key={p.id} position={p} value={values[p.id]} onChange={(v) => setValue(p.id, v)} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-concrete border-t border-concrete-dim px-4 py-3">
        <Button variant="primary" onClick={handleSubmit} disabled={filledCount === 0}>
          Отправить в BIS
        </Button>
      </div>
    </div>
  )
}
