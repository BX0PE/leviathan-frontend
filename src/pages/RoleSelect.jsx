import { useNavigate } from 'react-router-dom'
import { saveRole } from '../api/auth.js'
import { client } from '../api/client.js'
import logo from '../assets/logo.png'

const ROLES = [
  {
    key: 'coordinator',
    icon: '📋',
    title: 'Koordinators',
    subtitle: 'Būvdarbu vadītājs',
    desc: 'Tāmju un dokumentu augšupielāde, progresa pārskats',
  },
  {
    key: 'foreman',
    icon: '👷',
    title: 'Priekšnieks',
    subtitle: 'Darbu veicējs',
    desc: 'Ikdienas izpildīto darbu ievade',
  },
  {
    key: 'supervisor',
    icon: '🔍',
    title: 'Uzraugs',
    subtitle: 'Būvuzraugs',
    desc: 'Būvdarbu vadītāja ierakstu pārbaude un apstiprināšana',
  },
]

export default function RoleSelect() {
  const navigate = useNavigate()

  async function handleSelect(role) {
    saveRole(role)
    // Persist role on backend (silent fail — affects team management)
    client.post('/users/setup', { role }).catch(() => {})
    const onboarded = localStorage.getItem('leviathan_onboarded')
    if (role === 'coordinator' && !onboarded) {
      navigate('/onboarding', { replace: true })
    } else {
      navigate('/cases', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center px-6">
      <span className="absolute top-4 left-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none">LOMA</span>

      <div className="w-full max-w-sm flex flex-col items-center">
        <img src={logo} alt="LEVIATHAN" className="w-36 mb-3 select-none" draggable={false} />

        <p className="text-[11px] font-mono text-white/40 tracking-widest uppercase mb-8">
          Izvēlies savu lomu
        </p>

        {/* Role rows — flat, no cards */}
        <div className="w-full border border-white/10">
          {ROLES.map((r, i) => (
            <button
              key={r.key}
              onClick={() => handleSelect(r.key)}
              className="w-full text-left flex items-stretch border-b border-white/10 last:border-b-0 hover:bg-white/5 active:bg-white/10 transition min-h-tap group"
            >
              {/* Orange left strip on hover */}
              <div className="w-[3px] shrink-0 bg-transparent group-hover:bg-brand transition-colors" />
              <div className="flex items-center gap-4 px-4 py-4 flex-1">
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm tracking-wide">{r.title}</p>
                  <p className="text-[11px] font-mono text-white/40 tracking-widest uppercase mt-0.5">{r.subtitle}</p>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">{r.desc}</p>
                </div>
                <span className="font-mono text-white/30 group-hover:text-white/60 transition">›</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
