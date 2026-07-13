import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { goToBisLogin, saveToken } from '../api/auth.js'
import { client } from '../api/client.js'
import logo from '../assets/logo.png'

export default function Login() {
  const navigate = useNavigate()

  async function handleDemoLogin() {
    try {
      const { data } = await client.post('/auth/demo')
      saveToken(data.token)
      navigate('/role-select')
    } catch (e) {
      alert('Neizdevās savienoties ar serveri.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-asphalt text-white">
      <div className="w-full max-w-xs flex flex-col items-center text-center">
        <img src={logo} alt="LEVIATHAN" className="w-48 mb-8 select-none" draggable={false} />
        <p className="text-concrete-dim mb-10 leading-relaxed">
          BIS automatizācija
          <br />
          būvdarbu vadītājiem
        </p>
        <Button variant="primary" onClick={goToBisLogin}>
          Pieteikties ar BIS
        </Button>

        <button
          onClick={handleDemoLogin}
          className="mt-4 text-sm text-concrete-dim underline underline-offset-2 min-h-tap"
        >
          Demo pieteikšanās
        </button>
      </div>
    </div>
  )
}
