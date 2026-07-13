import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import { submitEntries } from '../api/cases.js'
import { useToast } from '../components/Toast.jsx'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function todayDisplay() {
  return new Date().toLocaleDateString('lv-LV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ConfirmSubmit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state

  if (!state || !state.items || state.items.length === 0) {
    navigate(`/cases/${id}`, { replace: true })
    return null
  }

  const { caseName, items } = state
  const toast = useToast()

  async function handleConfirm() {
    try {
      const result = await submitEntries({ caseId: Number(id), date: todayIso(), items })
      toast.add({ type: 'success', message: `${result.created} ieraksti nosūtīti uz BIS` })
      navigate(`/cases/${id}/status`, { state: { ok: true, synced: result.synced, count: result.created } })
    } catch (error) {
      toast.add({ type: 'error', message: 'Neizdevās nosūtīt. Mēģini vēlreiz.' })
      navigate(`/cases/${id}/status`, { state: { ok: false, message: 'Neizdevās nosūtīt. Mēģini vēlreiz.' } })
    }
  }

  return (
    <div className="min-h-screen bg-concrete flex flex-col">
      <Header title={caseName} onBack={true} />

      {/* Date bar */}
      <div className="bg-asphalt px-4 py-2 flex items-center gap-3">
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">Datums</span>
        <span className="font-mono text-[11px] text-white/70">{todayDisplay()}</span>
      </div>

      <div className="flex-1 px-4 pt-5">
        <div className="section-label mb-4">Pārbaudi pirms nosūtīšanas</div>

        {/* Items table */}
        <div className="bg-card border border-concrete-dim mb-5">
          <div className="grid grid-cols-[1fr_auto] px-4 py-2 border-b border-concrete-dim bg-concrete">
            <span className="text-[11px] font-mono text-asphalt-soft tracking-widest uppercase">Pozīcija</span>
            <span className="text-[11px] font-mono text-asphalt-soft tracking-widest uppercase">Daudzums</span>
          </div>
          {items.map((item) => (
            <div key={item.position_id} className="grid grid-cols-[1fr_auto] items-center px-4 py-3 border-b border-concrete-dim last:border-b-0">
              <span className="text-sm font-medium text-asphalt pr-4">{item.name}</span>
              <span className="font-mono text-sm font-semibold text-asphalt whitespace-nowrap">
                {item.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pb-8">
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
