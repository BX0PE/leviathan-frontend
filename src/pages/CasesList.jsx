import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { fetchCases } from '../api/cases.js'
import { clearAll, getRole } from '../api/auth.js'

const STAGE_LABEL = { active: 'Активный', done: 'Завершён' }
const STAGE_ICON = { active: '🏗', done: '🏠' }

export default function CasesList() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    fetchCases().then((data) => {
      if (!cancelled) {
        setCases(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const role = getRole()
  const ROLE_LABEL = { coordinator: '📋 Координатор', foreman: '👷 Прораб', supervisor: '🔍 Надзор' }

  function handleLogout() {
    clearAll()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-concrete pb-6">
      <Header
        title="LEVIATHAN"
        right={
          <div className="flex items-center gap-3">
            {role && <span className="text-xs text-concrete-dim">{ROLE_LABEL[role]}</span>}
            <button onClick={handleLogout} className="text-sm text-concrete-dim font-medium min-h-tap px-2">
              Выход
            </button>
          </div>
        }
      />
      <div className="px-4 pt-4">
        <h2 className="font-display font-semibold text-xl mb-3">Мои объекты</h2>

        <button
          onClick={() => navigate('/materials-demo')}
          className="w-full text-left mb-4 bg-brand/10 border border-brand rounded-card px-4 py-3 text-brand font-medium min-h-tap"
        >
          Макет: согласование материалов →
        </button>

        {loading && <p className="text-asphalt-soft">Загружаем объекты…</p>}

        <div className="flex flex-col gap-3">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="bg-card rounded-card shadow-sm text-left px-4 py-4 flex items-center gap-3 min-h-tap active:bg-concrete-dim"
            >
              <span className="text-2xl">{STAGE_ICON[c.stage] || '🏢'}</span>
              <div>
                <p className="font-semibold text-base">{c.name}</p>
                <p className="text-sm text-asphalt-soft">Рига · {STAGE_LABEL[c.stage] || c.stage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
