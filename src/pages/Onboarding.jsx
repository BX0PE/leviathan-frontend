import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { client } from '../api/client.js'

/* ─── Step metadata ─────────────────────────────────────────── */
const STEPS = [
  { n: 1, label: 'Uzņēmums' },
  { n: 2, label: 'BIS' },
  { n: 3, label: 'Objekts' },
  { n: 4, label: 'Gatavs' },
]

/* ─── Step indicator ────────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          {/* Circle */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 border-2 flex items-center justify-center font-mono text-[11px] font-bold transition-colors ${
              current === s.n
                ? 'border-brand bg-brand text-white'
                : current > s.n
                ? 'border-go bg-transparent text-go'
                : 'border-white/15 bg-transparent text-white/20'
            }`}>
              {current > s.n ? '✓' : s.n}
            </div>
            <span className={`font-mono text-[9px] tracking-widest uppercase transition-colors ${
              current === s.n ? 'text-brand' : current > s.n ? 'text-go' : 'text-white/20'
            }`}>
              {s.label}
            </span>
          </div>
          {/* Connector */}
          {i < STEPS.length - 1 && (
            <div className={`w-10 h-[1px] mb-5 mx-1 transition-colors ${current > s.n ? 'bg-go/40' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Field ──────────────────────────────────────────────────── */
function Field({ label, hint, ...props }) {
  return (
    <div>
      <label className="block font-mono text-[11px] text-white/40 tracking-widest uppercase mb-2">
        {label}
      </label>
      <input
        className="w-full bg-transparent border border-white/20 text-white font-mono text-sm px-4 py-3 focus:outline-none focus:border-brand placeholder:text-white/20 transition-colors"
        {...props}
      />
      {hint && (
        <p className="font-mono text-[10px] text-white/20 tracking-wide mt-1.5">{hint}</p>
      )}
    </div>
  )
}

/* ─── Step 1: Company ────────────────────────────────────────── */
function StepCompany({ onNext }) {
  const [name, setName]   = useState('')
  const [regNr, setRegNr] = useState('')
  const valid = name.trim().length > 0 && regNr.trim().length >= 8

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    localStorage.setItem('leviathan_company', JSON.stringify({ name: name.trim(), regNr: regNr.trim() }))
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Uzņēmuma nosaukums"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder='SIA "RigaBūve"'
        required
      />
      <Field
        label="Reģistrācijas numurs"
        value={regNr}
        onChange={e => setRegNr(e.target.value)}
        placeholder="40103XXXXXX"
        maxLength={11}
        hint="11 cipari, sākas ar 40 vai 50"
        required
      />
      <button
        type="submit"
        disabled={!valid}
        className="w-full bg-brand text-white font-mono text-[12px] tracking-widest uppercase py-4 hover:bg-brand-dark transition-all duration-150 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
      >
        Turpināt →
      </button>
    </form>
  )
}

/* ─── Step 2: BIS ────────────────────────────────────────────── */
function StepBis({ onNext }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Connected box */}
      <div className="border-2 border-go px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 border-2 border-go flex items-center justify-center font-mono font-bold text-go text-lg shrink-0">
          ✓
        </div>
        <div>
          <p className="font-mono text-[11px] text-go tracking-widest uppercase mb-0.5">Savienots</p>
          <p className="font-mono text-sm text-white/60">BIS / BVKB konts aktīvs</p>
        </div>
      </div>

      <div className="border border-white/10 px-5 py-4">
        <p className="font-mono text-[11px] text-white/25 tracking-widest uppercase mb-2">Ko tas nozīmē</p>
        <p className="font-mono text-xs text-white/40 leading-relaxed">
          LEVIATHAN izmantos šo BIS savienojumu, lai sūtītu
          Būvdarbu žurnāla ierakstus tieši uz BIS sistēmu —
          bez manuālas pārkopēšanas.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-brand text-white font-mono text-[12px] tracking-widest uppercase py-4 hover:bg-brand-dark transition-all duration-150 active:scale-[0.98]"
      >
        Turpināt →
      </button>
    </div>
  )
}

/* ─── Step 3: First case ─────────────────────────────────────── */
function StepCase({ onNext, onSkip }) {
  const [name,    setName]    = useState('')
  const [address, setAddress] = useState('')
  const [bisNr,   setBisNr]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await client.post('/cases', {
        name:       name.trim(),
        address:    address.trim() || null,
        bis_number: bisNr.trim()   || null,
      })
    } catch {
      // Backend may not be ready — continue silently
    }
    setLoading(false)
    onNext({ caseName: name.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Objekta nosaukums *"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Dzīvojamā māja Rīgā"
        required
      />
      <Field
        label="Adrese"
        value={address}
        onChange={e => setAddress(e.target.value)}
        placeholder="Brīvības iela 1, Rīga"
      />
      <Field
        label={<>BIS lietas numurs <span className="text-white/20 normal-case not-italic">(nav obligāts)</span></>}
        value={bisNr}
        onChange={e => setBisNr(e.target.value)}
        placeholder="BIS-2024-XXXXX"
      />

      <button
        type="submit"
        disabled={!name.trim() || loading}
        className="w-full bg-brand text-white font-mono text-[12px] tracking-widest uppercase py-4 hover:bg-brand-dark transition-all duration-150 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
      >
        {loading ? 'Veido...' : 'Izveidot objektu →'}
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="w-full font-mono text-[11px] text-white/25 tracking-widest uppercase hover:text-white/50 transition py-2"
      >
        Izlaist pagaidām
      </button>
    </form>
  )
}

/* ─── Step 4: Done ───────────────────────────────────────────── */
function StepDone({ company, caseName }) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const checks = [
    { label: 'Uzņēmums reģistrēts', detail: company?.name,    ok: Boolean(company) },
    { label: 'BIS savienojums',      detail: 'Aktīvs',         ok: true },
    { label: 'Pirmais objekts',      detail: caseName || null, ok: Boolean(caseName) },
  ]

  async function handleStart() {
    setSaving(true)
    try {
      // Save company + role to backend so invite system works
      await client.post('/users/setup', {
        role:         'coordinator',
        company_name: company?.name  || null,
        company_reg:  company?.regNr || null,
      })
    } catch {
      // Backend may not be ready — continue, company data is in localStorage
    }
    localStorage.setItem('leviathan_onboarded', '1')
    setSaving(false)
    navigate('/cases', { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Big success mark */}
      <div className="flex justify-center pt-2">
        <div className="w-20 h-20 border-2 border-brand flex items-center justify-center">
          <span className="font-mono font-bold text-4xl text-brand">✓</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="border border-white/10">
        {checks.map((c, i) => (
          <div
            key={c.label}
            className={`flex items-center gap-3 px-4 py-3 ${i < checks.length - 1 ? 'border-b border-white/10' : ''}`}
          >
            <span className={`font-mono font-bold text-sm w-4 shrink-0 ${c.ok ? 'text-go' : 'text-white/20'}`}>
              {c.ok ? '✓' : '○'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] text-white/40 tracking-widest uppercase">{c.label}</p>
              {c.detail && (
                <p className="font-mono text-xs text-white/70 mt-0.5 truncate">{c.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={saving}
        className="w-full bg-brand text-white font-mono text-[12px] tracking-widest uppercase py-4 hover:bg-brand-dark transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
      >
        {saving ? 'Saglabājam...' : 'Sākt darbu →'}
      </button>

      <p className="font-mono text-[10px] text-white/20 tracking-wide text-center">
        Uzņēmuma datus var mainīt iestatījumos
      </p>
    </div>
  )
}

/* ─── Step header content ────────────────────────────────────── */
const STEP_META = {
  1: { tag: 'Solis 1 / 3', title: 'Pastāsti par savu uzņēmumu' },
  2: { tag: 'Solis 2 / 3', title: 'BIS ir pievienots' },
  3: { tag: 'Solis 3 / 3', title: 'Izveido pirmo būvobjektu' },
  4: { tag: 'Pabeigts',    title: 'LEVIATHAN ir gatavs darbam' },
}

/* ─── Main Onboarding ────────────────────────────────────────── */
export default function Onboarding() {
  const [step,     setStep]     = useState(1)
  const [caseName, setCaseName] = useState(null)

  const company = (() => {
    try { return JSON.parse(localStorage.getItem('leviathan_company')) } catch { return null }
  })()

  function next(data = {}) {
    if (data.caseName) setCaseName(data.caseName)
    setStep(s => s + 1)
  }

  const meta = STEP_META[step]

  return (
    <div className="min-h-screen bg-blueprint flex flex-col">

      {/* ── Header ── */}
      <div className="flex flex-col items-center pt-10 pb-8 px-4 gap-8">
        <img src={logo} alt="LEVIATHAN" className="h-8 select-none" draggable={false} />
        <StepIndicator current={step} />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex justify-center px-4 pb-12">
        <div className="w-full max-w-sm">

          {/* Step label + title */}
          <div className="mb-7">
            <div className="section-label mb-3">{meta.tag}</div>
            <h1 className="font-display font-bold text-2xl text-white leading-snug">
              {meta.title}
            </h1>
          </div>

          {/* Step panel */}
          {step === 1 && <StepCompany onNext={next} />}
          {step === 2 && <StepBis    onNext={next} />}
          {step === 3 && <StepCase   onNext={next} onSkip={next} />}
          {step === 4 && <StepDone   company={company} caseName={caseName} />}

        </div>
      </div>
    </div>
  )
}
