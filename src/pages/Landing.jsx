import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

/* ─── Value Calculator ──────────────────────────────────────── */
function Calculator() {
  const [objects,  setObjects]  = useState(3)
  const [hours,    setHours]    = useState(24)
  const [rate,     setRate]     = useState(18)

  const loss     = objects * hours * rate
  const plan     = objects <= 2 ? 150 : 450
  const saving   = Math.max(0, loss - plan)
  const savingYr = saving * 12

  const fmt = (n) => n.toLocaleString('lv-LV', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  return (
    <section className="bg-concrete border-y border-concrete-dim py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="section-label mb-6">Kalkulators</div>
        <h2 className="font-display font-bold text-2xl text-asphalt mb-8">
          Cik izmaksā manuālā BIS ievade jūsu uzņēmumam?
        </h2>

        {/* Sliders */}
        <div className="bg-card border border-concrete-dim mb-6">
          {[
            { label: 'Aktīvie objekti',                val: objects, set: setObjects, min: 1,  max: 20, unit: '' },
            { label: 'Stundas mēnesī datu ievadei',   val: hours,   set: setHours,   min: 4,  max: 80, unit: 'h' },
            { label: 'PTO speciālista stundas likme', val: rate,    set: setRate,    min: 12, max: 35, unit: '€' },
          ].map(({ label, val, set, min, max, unit }) => (
            <div key={label} className="px-6 py-4 border-b border-concrete-dim last:border-b-0">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase">{label}</span>
                <span className="font-mono text-sm font-bold text-asphalt">{unit === '€' ? `${unit}${val}` : `${val} ${unit}`}</span>
              </div>
              <input
                type="range" min={min} max={max} value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full accent-brand h-[2px] cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border-2 border-danger bg-card px-6 py-5">
            <p className="font-mono text-[11px] text-danger tracking-widest uppercase mb-2">Manuālā darba izmaksas</p>
            <p className="font-mono font-bold text-3xl text-danger">{fmt(loss)}</p>
            <p className="font-mono text-[11px] text-asphalt-soft tracking-wide mt-1">mēnesī</p>
          </div>
          <div className="border-2 border-go bg-card px-6 py-5">
            <p className="font-mono text-[11px] text-go tracking-widest uppercase mb-2">Ar LEVIATHAN</p>
            <p className="font-mono font-bold text-3xl text-go">{fmt(plan)}</p>
            <p className="font-mono text-[11px] text-asphalt-soft tracking-wide mt-1">mēnesī</p>
          </div>
        </div>

        <div className="bg-asphalt px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] text-white/40 tracking-widest uppercase">Ietaupījums mēnesī</p>
            <p className="font-mono font-bold text-xl text-brand">{fmt(saving)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px] text-white/40 tracking-widest uppercase">Kopējais gadā</p>
            <p className="font-mono font-bold text-xl text-white">{fmt(savingYr)}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ───────────────────────────────────────────────── */
const PLANS = [
  {
    key: 'tests',
    name: 'TESTS',
    price: '€0',
    period: '30 dienas',
    objects: '1 objekts',
    features: ['Visas funkcijas', 'BIS integrācija', 'Bez saistībām'],
    cta: 'Sākt bez maksas',
    highlight: false,
  },
  {
    key: 'starts',
    name: 'STARTS',
    price: '€150',
    period: 'mēnesī',
    objects: 'līdz 2 objektiem',
    features: ['Visas funkcijas', 'BIS integrācija', 'Atbalsts e-pastā'],
    cta: 'Izvēlēties',
    highlight: true,
  },
  {
    key: 'bizness',
    name: 'BIZNESS',
    price: '€450',
    period: 'mēnesī',
    objects: 'līdz 5 objektiem',
    features: ['Visas funkcijas', 'BIS integrācija', 'Prioritārs atbalsts', 'SLA 99.9%'],
    cta: 'Izvēlēties',
    highlight: false,
  },
]

function Pricing({ onLogin }) {
  return (
    <section className="py-16 px-4 bg-concrete">
      <div className="max-w-3xl mx-auto">
        <div className="section-label mb-6">Tarifi</div>
        <h2 className="font-display font-bold text-2xl text-asphalt mb-8">Vienkārša cenu struktūra</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((p) => (
            <div key={p.key}
              className={`bg-card flex flex-col border-2 ${p.highlight ? 'border-brand' : 'border-concrete-dim'}`}
            >
              {/* Header */}
              <div className={`px-5 py-4 border-b border-concrete-dim ${p.highlight ? 'bg-asphalt' : 'bg-concrete'}`}>
                <p className={`font-mono text-[11px] tracking-widest uppercase font-bold mb-1 ${p.highlight ? 'text-brand' : 'text-asphalt-soft'}`}>
                  {p.highlight ? '★ ' : ''}{p.name}
                </p>
                <p className={`font-mono font-bold text-3xl ${p.highlight ? 'text-white' : 'text-asphalt'}`}>{p.price}</p>
                <p className={`font-mono text-[11px] tracking-wide mt-0.5 ${p.highlight ? 'text-white/40' : 'text-asphalt-soft'}`}>{p.period}</p>
              </div>

              {/* Features */}
              <div className="px-5 py-4 flex-1">
                <p className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase mb-3">{p.objects}</p>
                {p.features.map((f) => (
                  <p key={f} className="font-mono text-[12px] text-asphalt py-1 border-b border-concrete-dim last:border-b-0">
                    {f}
                  </p>
                ))}
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                <button
                  onClick={onLogin}
                  className={`w-full py-3 font-mono text-[12px] tracking-widest uppercase font-semibold transition ${
                    p.highlight
                      ? 'bg-brand text-white hover:bg-brand-dark'
                      : 'border border-concrete-dim text-asphalt hover:border-asphalt hover:bg-concrete'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="font-mono text-[11px] text-asphalt-soft tracking-wide text-center mt-4">
          Visi tarifi ietver BIS Būvdarbu žurnāla automatizāciju un PDF dokumentu apstrādi.
        </p>
      </div>
    </section>
  )
}

/* ─── Main Landing ──────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-concrete">

      {/* NAV */}
      <nav className="bg-asphalt border-b-2 border-brand sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 min-h-[52px] flex items-center gap-4">
          <img src={logo} alt="LEVIATHAN" className="h-7 select-none" draggable={false} />
          <div className="flex-1" />
          <a
            href="mailto:leviathanworkgroup@gmail.com"
            className="font-mono text-[11px] text-white/60 tracking-widest uppercase hover:text-white transition px-3 py-1"
          >
            Pieprasīt demo
          </a>
          <button
            onClick={() => navigate('/login')}
            className="bg-brand text-white font-mono text-[11px] tracking-widest uppercase px-4 py-2 hover:bg-brand-dark transition"
          >
            Pieteikties →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-blueprint min-h-[85vh] flex items-center px-4 py-16">
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
            <p className="font-mono text-[11px] text-brand tracking-widest uppercase mb-4">
              Būvniecības dokumentāciju automatizācija · Latvija
            </p>
            <h1 className="font-display font-bold text-4xl lg:text-5xl text-white leading-tight mb-6">
              BIS žurnāls<br />
              <span className="text-brand">bez manuālā</span><br />
              darba.
            </h1>
            <p className="font-mono text-sm text-white/50 leading-relaxed mb-8 max-w-sm">
              Manuālā ievade vienā objektā izmaksā uzņēmumam
              <span className="text-white font-semibold"> €660–€1000 mēnesī</span>.
              LEVIATHAN to izpilda 10 minūtēs.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-0 border border-white/10 mb-2">
              <div className="px-4 py-4 border-r border-white/10">
                <p className="font-display font-bold text-3xl text-white">80%</p>
                <p className="font-mono text-[10px] text-white/35 tracking-widest uppercase mt-1 leading-relaxed">mazāk<br/>manuālā darba</p>
              </div>
              <div className="px-4 py-4 border-r border-white/10">
                <p className="font-display font-bold text-3xl text-brand">10×</p>
                <p className="font-mono text-[10px] text-white/35 tracking-widest uppercase mt-1 leading-relaxed">ātrāk nekā<br/>manuāli</p>
              </div>
              <div className="px-4 py-4">
                <p className="font-display font-bold text-3xl text-white">€850</p>
                <p className="font-mono text-[10px] text-white/35 tracking-widest uppercase mt-1 leading-relaxed">ietaupīts<br/>mēnesī</p>
              </div>
            </div>
            <p className="font-mono text-[10px] text-white/25 tracking-wide mb-8">
              * aptuvenie rādītāji vienam vidēja izmēra objektam
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-brand text-white font-mono text-[12px] tracking-widest uppercase px-8 py-4 hover:bg-brand-dark transition"
              >
                Izmēģināt bez maksas
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border border-white/20 text-white/60 font-mono text-[12px] tracking-widest uppercase px-8 py-4 hover:border-white/40 hover:text-white transition"
              >
                Pieteikties demo
              </button>
            </div>

          </div>

          {/* Right — before/after visual */}
          <div className="grid grid-cols-2 gap-2">
            {/* BEFORE */}
            <div className="border border-danger/30 bg-asphalt/80">
              <div className="px-3 py-2 border-b border-danger/30 flex items-center gap-2">
                <div className="w-[3px] h-3 bg-danger" />
                <span className="font-mono text-[10px] text-danger tracking-widest uppercase">Tagad</span>
              </div>
              <div className="px-3 py-4 flex flex-col gap-2">
                {[
                  'Excel tāme (manuāla)',
                  'Manuāla datu ievade',
                  'PDF meklēšana mapēs',
                  'Pārrakstīšanas kļūdas',
                  'Nav pārskata par progresu',
                  '3–4h vienam objektam',
                ].map((l) => (
                  <div key={l} className="font-mono text-[11px] text-white/40 py-1 border-b border-white/5 last:border-0">{l}</div>
                ))}
              </div>
            </div>

            {/* AFTER */}
            <div className="border border-go/30 bg-asphalt/80">
              <div className="px-3 py-2 border-b border-go/30 flex items-center gap-2">
                <div className="w-[3px] h-3 bg-go" />
                <span className="font-mono text-[10px] text-go tracking-widest uppercase">LEVIATHAN</span>
              </div>
              <div className="px-3 py-4 flex flex-col gap-2">
                {[
                  '↑ tāme.xlsx (viens fails)',
                  '✓ Automātiska datu ievade',
                  '↑ PDF drag & drop',
                  '✓ Automātiska dokumentu piesaiste',
                  '✓ Reālā laika progress',
                  '✓ 10 min. melnraksts',
                ].map((l) => (
                  <div key={l} className={`font-mono text-[11px] py-1 border-b border-white/5 last:border-0 ${l.startsWith('✓') ? 'text-go' : 'text-white/60'}`}>{l}</div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 bg-card border-b border-concrete-dim">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-6">Kā tas strādā</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-concrete-dim">
            {[
              { n: '01', title: 'Augšupielādē tāmi', desc: 'Excel tāme → sistēma automātiski izveido visas pozīcijas' },
              { n: '02', title: 'Pievieno dokumentus', desc: 'PDF pases un sertifikāti → automātiski piesaistās pie pozīcijām' },
              { n: '03', title: 'Nosūtīšana uz BIS', desc: 'Ar vienu klikšķi dati tiek nosūtīti uz BIS būvdarbu žurnālu kā melnraksts.' },
            ].map((s, i) => (
              <div key={s.n} className={`px-6 py-6 ${i < 2 ? 'border-b sm:border-b-0 sm:border-r border-concrete-dim' : ''}`}>
                <p className="font-mono font-bold text-3xl text-brand mb-3">{s.n}</p>
                <p className="font-semibold text-sm text-asphalt mb-2">{s.title}</p>
                <p className="font-mono text-[11px] text-asphalt-soft tracking-wide leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <Calculator />

      {/* PRICING */}
      <Pricing onLogin={() => navigate('/login')} />

      {/* CONTACT */}
      <section className="bg-asphalt border-t border-white/10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-6">Sazināties</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-3">
                Vēlies uzzināt vairāk?
              </h2>
              <p className="font-mono text-[12px] text-white/40 leading-relaxed">
                Raksti mums vai piesakies demo.<br />
                Atbildēsim 24 stundu laikā.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:leviathanworkgroup@gmail.com?subject=Demo pieprasījums"
                className="bg-brand text-white font-mono text-[12px] tracking-widest uppercase px-6 py-4 hover:bg-brand-dark transition text-center"
              >
                Pieprasīt demo →
              </a>
              <a
                href="mailto:leviathanworkgroup@gmail.com"
                className="border border-white/20 text-white/50 font-mono text-[12px] tracking-widest uppercase px-6 py-4 hover:border-white/40 hover:text-white transition text-center"
              >
                leviathanworkgroup@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-blueprint py-16 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <p className="font-mono text-[11px] text-brand tracking-widest uppercase mb-4">Gatavs sākt?</p>
          <h2 className="font-display font-bold text-3xl text-white mb-6">
            30 dienas bez maksas.<br />Bez saistībām.
          </h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-brand text-white font-mono text-[12px] tracking-widest uppercase px-10 py-4 hover:bg-brand-dark transition"
          >
            Sākt izmēģināt →
          </button>
          <p className="font-mono text-[11px] text-white/25 tracking-wide mt-6">
            Jautājumi? leviathanworkgroup@gmail.com
          </p>
        </div>
      </section>

    </div>
  )
}
