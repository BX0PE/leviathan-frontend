import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Button from '../components/Button.jsx'
import WorkflowStepper from '../components/WorkflowStepper.jsx'
import { smetaPositionsForMaterials, makeMaterialDraft } from '../mock/materials.js'

// Prototips bez bēkenda: parāda visu procesu no brīfa —
// Projektētājs → Saskaņošana → Nosūtīšana uz objektu → Saņemšana
// priekšniekam. Stāvoklis dzīvo tikai šajā lapā, nekas nekur
// netiek sūtīts. Nepieciešams, lai saskaņotu procesu ar priekšnieku,
// pirms pievienot reālos API.
export default function MaterialsWorkflow() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ positionId: smetaPositionsForMaterials[0].id, name: '', qty: '' })
  const [reviewComment, setReviewComment] = useState('')
  const [receivedQty, setReceivedQty] = useState({})

  function addItem() {
    if (!form.name || !form.qty) return
    const position = smetaPositionsForMaterials.find((p) => p.id === Number(form.positionId))
    setItems((prev) => [
      ...prev,
      { ...makeMaterialDraft(position.id, form.name, position.unit), quantity: form.qty, status: 'draft' }
    ])
    setForm({ positionId: form.positionId, name: '', qty: '' })
  }

  function sendForReview() {
    setItems((prev) => prev.map((it) => ({ ...it, status: 'on_review' })))
    setStep(1)
  }

  function approveAll() {
    setItems((prev) => prev.map((it) => ({ ...it, status: 'approved' })))
    setStep(2)
  }

  function requestChanges() {
    if (!reviewComment.trim()) return
    setItems((prev) => prev.map((it) => ({ ...it, status: 'needs_changes', comment: reviewComment })))
    setStep(0)
  }

  function confirmReceipt() {
    setStep(3)
  }

  return (
    <div className="min-h-screen bg-concrete pb-8">
      <Header title="Materiāli — procesa makets" onBack={() => navigate('/cases')} />
      <WorkflowStepper current={step} />

      {step === 0 && (
        <div className="px-4 pt-4">
          <p className="text-sm text-asphalt-soft mb-4">
            Projektētājs ņem tāmes pozīciju un ievada tai materiālu.
          </p>

          {items.some((it) => it.status === 'needs_changes') && (
            <div className="bg-caution/20 border border-caution rounded-card px-4 py-3 mb-4">
              <p className="font-semibold text-sm mb-1">Pasūtītājs lūdz izmaiņas</p>
              <p className="text-sm text-asphalt-soft">{items[0]?.comment}</p>
            </div>
          )}

          <div className="bg-card rounded-card shadow-sm px-4 py-4 mb-4">
            <label className="block text-sm font-medium text-asphalt-soft mb-1">Tāmes pozīcija</label>
            <select
              value={form.positionId}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
              className="w-full min-h-tap rounded-card border-2 border-asphalt-soft bg-white px-3 mb-3"
            >
              {smetaPositionsForMaterials.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.group} — {p.name}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-asphalt-soft mb-1">Materiāls</label>
            <input
              type="text"
              placeholder="Piemēram, cements M400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full min-h-tap rounded-card border-2 border-asphalt-soft bg-white px-3 mb-3"
            />

            <label className="block text-sm font-medium text-asphalt-soft mb-1">Daudzums</label>
            <input
              type="number"
              placeholder="0"
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: e.target.value })}
              className="w-full min-h-tap rounded-card border-2 border-asphalt-soft bg-white px-3 mb-3"
            />

            <Button variant="dark" onClick={addItem}>
              + Pievienot sarakstam
            </Button>
          </div>

          {items.length > 0 && (
            <div className="bg-card rounded-card shadow-sm px-4 py-3 mb-4">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-rebar mb-2">
                Ievadītie materiāli
              </h2>
              {items.map((it) => (
                <div key={it.id} className="flex justify-between py-2 border-b border-concrete-dim last:border-b-0">
                  <span>{it.name}</span>
                  <span className="font-mono">
                    {it.quantity} {it.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button variant="primary" onClick={sendForReview} disabled={items.length === 0}>
            Nosūtīt saskaņošanai
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="px-4 pt-4">
          <p className="text-sm text-asphalt-soft mb-4">
            Pasūtītājs un priekšnieks redz sarakstu un vai nu apstiprina, vai lūdz izmaiņas.
          </p>

          <div className="bg-card rounded-card shadow-sm px-4 py-3 mb-4">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between py-2 border-b border-concrete-dim last:border-b-0">
                <span>{it.name}</span>
                <span className="font-mono">
                  {it.quantity} {it.unit}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-card shadow-sm px-4 py-3 mb-4">
            <label className="block text-sm font-medium text-asphalt-soft mb-1">
              Komentārs (ja nepieciešamas izmaiņas)
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Piemēram: nomainiet cementa marku"
              rows={2}
              className="w-full rounded-card border-2 border-asphalt-soft bg-white px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={approveAll}>
              ✓ Apstiprināt
            </Button>
            <Button variant="outline" onClick={requestChanges} disabled={!reviewComment.trim()}>
              Nosūtīt labošanai
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="px-6 pt-10 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-display font-semibold text-xl mb-2">Materiāli apstiprināti</h2>
          <p className="text-asphalt-soft mb-8 max-w-xs">
            Saraksts nosūtīts uz objektu. Kad materiāli pienāks, priekšnieks apstiprina saņemšanu.
          </p>
          <div className="w-full max-w-xs">
            <Button variant="primary" onClick={confirmReceipt}>
              Priekšnieks: apstiprināt saņemšanu
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="px-4 pt-4">
          <p className="text-sm text-asphalt-soft mb-4">
            Priekšnieks pārbauda, kas reāli pienācis uz objektu, pa katru pozīciju.
          </p>

          <div className="bg-card rounded-card shadow-sm px-4 py-3 mb-4">
            {items.map((it) => (
              <div key={it.id} className="py-3 border-b border-concrete-dim last:border-b-0">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{it.name}</span>
                  <span className="font-mono text-asphalt-soft">
                    pasūtīts: {it.quantity} {it.unit}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-asphalt-soft shrink-0">Pienāca:</label>
                  <input
                    type="number"
                    placeholder={it.quantity}
                    value={receivedQty[it.id] ?? ''}
                    onChange={(e) => setReceivedQty({ ...receivedQty, [it.id]: e.target.value })}
                    className="flex-1 min-h-tap rounded-card border-2 border-asphalt-soft bg-white px-3 text-right font-mono"
                  />
                  <span className="font-mono text-sm text-asphalt-soft w-8">{it.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="primary" onClick={() => navigate('/cases')}>
            Apstiprināt saņemšanu
          </Button>
          <p className="text-xs text-asphalt-soft text-center mt-3">
            Tālāk materiālu patēriņš tiek norakstīts esošajā objekta ekrānā, kopā ar darbu apjomiem.
          </p>
        </div>
      )}
    </div>
  )
}
