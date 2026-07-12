import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { goToBisLogin, saveToken } from '../api/auth.js'

export default function Login() {
  const navigate = useNavigate()

  // Dev-only shortcut: вызывает POST /api/auth/demo и получает настоящий JWT.
  // Vite автоматически убирает этот блок из production-сборки (import.meta.env.DEV).
  async function handleDevLogin() {
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' })
      const data = await res.json()
      saveToken(data.token)
      navigate('/role-select')
    } catch (e) {
      alert('Не удалось подключиться к бэкенду. Убедись что сервер запущен на порту 8000.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-asphalt text-white">
      <div className="w-full max-w-xs flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-card bg-brand flex items-center justify-center text-4xl mb-6">
          🏗
        </div>
        <h1 className="font-display font-bold text-3xl tracking-wide mb-2">LEVIATHAN</h1>
        <p className="text-concrete-dim mb-10 leading-relaxed">
          Автоматизация BIS
          <br />
          для прорабов
        </p>
        <Button variant="primary" onClick={goToBisLogin}>
          Войти через BIS
        </Button>

        {import.meta.env.DEV && (
          <button
            onClick={handleDevLogin}
            className="mt-4 text-sm text-concrete-dim underline underline-offset-2 min-h-tap"
          >
            Войти с мок-данными (для разработки)
          </button>
        )}
      </div>
    </div>
  )
}
