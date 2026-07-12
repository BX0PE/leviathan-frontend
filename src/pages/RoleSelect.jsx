import { useNavigate } from 'react-router-dom'
import { saveRole } from '../api/auth.js'

const ROLES = [
  {
    key: 'coordinator',
    icon: '📋',
    title: 'Koordinators',
    subtitle: 'Būvdarbu vadītājs',
    desc: 'Загрузка смет и документов, дашборд прогресса',
  },
  {
    key: 'foreman',
    icon: '👷',
    title: 'Priekšnieks',
    subtitle: 'Darbu veicējs',
    desc: 'Ввод выполненных работ каждый день',
  },
  {
    key: 'supervisor',
    icon: '🔍',
    title: 'Uzraugs',
    subtitle: 'Būvuzraugs',
    desc: 'Проверка и подтверждение записей прораба',
  },
]

export default function RoleSelect() {
  const navigate = useNavigate()

  function handleSelect(role) {
    saveRole(role)
    navigate('/cases', { replace: true })
  }

  return (
    <div className="min-h-screen bg-asphalt flex flex-col items-center justify-center px-6">
      <h1 className="font-display font-bold text-2xl text-white mb-1 tracking-wide">
        LEVIATHAN
      </h1>
      <p className="text-concrete-dim mb-10 text-sm">Выбери свою роль</p>

      <div className="w-full max-w-sm flex flex-col gap-4">
        {ROLES.map((r) => (
          <button
            key={r.key}
            onClick={() => handleSelect(r.key)}
            className="bg-card rounded-card shadow-sm px-5 py-4 text-left flex items-start gap-4 active:bg-concrete-dim min-h-tap"
          >
            <span className="text-3xl mt-0.5">{r.icon}</span>
            <div>
              <p className="font-display font-semibold text-base text-asphalt">{r.title}</p>
              <p className="text-xs text-asphalt-soft mb-1">{r.subtitle}</p>
              <p className="text-sm text-asphalt-soft">{r.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
