import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import { submitEntries } from '../api/cases.js'

function todayIso() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function todayDisplay() {
  return new Date().toLocaleDateString('lv-LV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ConfirmSubmit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state

  // Guards a direct link or a page refresh with no data in transit —
  // send the foreman back to re-enter today's numbers instead of
  // showing an empty confirmation.
  if (!state || !state.items || state.items.length === 0) {
    navigate(`/cases/${id}`, { replace: true })
    return null
  }

  const { caseName, items } = state

  async function handleConfirm() {
    try {
      const result = await submitEntries({ caseId: Number(id), date: todayIso(), items })
      navigate(`/cases/${id}/status`, { state: { ok: true, synced: result.synced, count: result.created } })
    } catch (error) {
      navigate(`/cases/${id}/status`, { state: { ok: false, message: 'Neizdevās nosūtīt. Mēģini vēlreiz.' } })
    }
  }

  return (
    <div className="min-h-screen bg-concrete flex flex-col">
      <Header title={caseName} onBack={true} />
      <div className="flex-1 px-6 pt-8 flex flex-col items-center">
        <h2 className="font-display font-semibold text-xl mb-6 text-center">Pārbaudi pirms nosūtīšanas</h2>
        <p className="font-mono text-sm text-asphalt-soft mb-6">📅 {todayDisplay()}</p>

        <div className="w-full bg-card rounded-card shadow-sm px-4 py-3 mb-8">
          {items.map((item) => (
            <div key={item.position_id} className="flex justify-between py-2 border-b border-concrete-dim last:border-b-0">
              <span className="font-medium">{item.name}</span>
              <span className="font-mono font-semibold">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-3 mt-auto pb-8">
          <Button variant="primary" onClick={handleConfirm}>
            ✓ Nosūtīt
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Labot
          </Button>
        </div>
      </div>
    </div>
  )
}
