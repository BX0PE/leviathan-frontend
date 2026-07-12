import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { goToBisLogin, saveToken } from '../api/auth.js'
import { client } from '../api/client.js'

export default function Login() {
  const navigate = useNavigate()

  async function handleDemoLogin() {
    try {
      const { data } = await client.post('/auth/demo')
      saveToken(data.token)
      navigate('/role-select')
    } catch (e) {
      alert('Не удалось подключиться к бэкенду.')
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

        <button
          onClick={handleDemoLogin}
          className="mt-4 text-sm text-concrete-dim underline underline-offset-2 min-h-tap"
        >
          Демо-вход
        </button>
      </div>
    </div>
  )
}
