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
    <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center px-6 text-white relative">

      {/* Corner marks — blueprint / CAD aesthetic */}
      <span className="absolute top-4 left-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none">LEVIATHAN PWA v1.0</span>
      <span className="absolute top-4 right-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none">BIS INTEGRĀCIJA</span>
      <span className="absolute bottom-4 left-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none">© 2026</span>

      {/* Cross-hair center mark */}
      <div className="absolute w-[1px] h-8 bg-brand/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-16 pointer-events-none" />
      <div className="absolute h-[1px] w-8 bg-brand/20 top-1/2 left-1/2 -translate-x-4 -translate-y-8 pointer-events-none" />

      <div className="w-full max-w-xs flex flex-col items-center text-center relative z-10">
        <img src={logo} alt="LEVIATHAN" className="w-52 mb-10 select-none" draggable={false} />

        {/* Orange divider line */}
        <div className="w-12 h-[2px] bg-brand mb-8" />

        <div className="w-full flex flex-col gap-3">
          <Button variant="primary" onClick={goToBisLogin}>
            Pieteikties ar BIS
          </Button>

          <button
            onClick={handleDemoLogin}
            className="w-full min-h-tap border border-white/20 text-white/60 text-sm font-mono tracking-widest uppercase hover:border-white/40 hover:text-white/80 transition"
          >
            Demo
          </button>
        </div>

        <p className="mt-8 text-[11px] font-mono text-white/25 tracking-wider uppercase">
          Būvdarbu žurnāla automatizācija
        </p>
      </div>
    </div>
  )
}
