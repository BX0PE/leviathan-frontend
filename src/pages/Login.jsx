import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { goToBisLogin, goToBisLoginPkce, saveToken, saveRole } from '../api/auth.js'
import { client } from '../api/client.js'
import logo from '../assets/logo.png'

export default function Login() {
  const navigate = useNavigate()
  const [bisLoading,  setBisLoading]  = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error,       setError]       = useState(null)

  async function handleBisLogin() {
    setError(null)
    setBisLoading(true)
    try {
      if (import.meta.env.VITE_BIS_CLIENT_ID) {
        // Продакшн: PKCE — браузер сам делает всё, Railway не нужен
        await goToBisLoginPkce()
      } else {
        // Локальная разработка: старый backend-redirect flow
        goToBisLogin()
      }
    } catch {
      setBisLoading(false)
      setError('Neizdevās sākt BIS pieteikšanos. Mēģini vēlreiz.')
    }
  }

  async function handleDemoLogin() {
    setError(null)
    setDemoLoading(true)
    try {
      const { data } = await client.post('/auth/demo')
      saveToken(data.token)
      // Демо-юзер — сразу координатор, без role-select и онбординга.
      saveRole('coordinator')
      localStorage.setItem('leviathan_onboarded', '1')
      // Легкая задержка чтобы человек успел заметить loading-state
      setTimeout(() => navigate('/cases'), 400)
    } catch (e) {
      setDemoLoading(false)
      setError('Demo režīms pašlaik nav pieejams. Sazinies ar mums pa e-pastu.')
    }
  }

  return (
    <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center px-6 text-white relative">

      {/* Corner marks — blueprint / CAD aesthetic */}
      <span className="absolute top-4 left-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none">LEVIATHAN PWA v1.0</span>
      <span className="absolute top-4 right-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none">BIS INTEGRĀCIJA</span>
      <span className="absolute bottom-4 left-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none">© 2026</span>

      <div className="w-full max-w-xs flex flex-col items-center text-center relative z-10">
        <img src={logo} alt="LEVIATHAN" className="w-52 mb-10 select-none" draggable={false} />

        {/* Orange divider line */}
        <div className="w-12 h-[2px] bg-brand mb-8" />

        <div className="w-full flex flex-col gap-3">
          <Button variant="primary" onClick={handleBisLogin} disabled={bisLoading || demoLoading}>
            {bisLoading ? 'Savienojas…' : 'Pieteikties ar BIS'}
          </Button>

          <button
            onClick={handleDemoLogin}
            disabled={bisLoading || demoLoading}
            className="w-full min-h-tap border border-white/20 text-white/60 text-sm font-mono tracking-widest uppercase hover:border-white/40 hover:text-white/80 transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
          >
            {demoLoading ? 'Ielādē demo…' : 'Iepazīties ar demo'}
          </button>
        </div>

        {error && (
          <div className="w-full mt-4 border border-danger/40 bg-danger/10 px-4 py-3">
            <p className="font-mono text-[11px] text-danger tracking-wide leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <p className="mt-8 text-[11px] font-mono text-white/25 tracking-wider uppercase">
          Būvdarbu žurnāla automatizācija
        </p>

        <p className="mt-2 text-[10px] font-mono text-white/20 tracking-wide leading-relaxed max-w-[240px]">
          Demo režīms izmanto paraugdatus.<br/>BIS dati netiek ietekmēti.
        </p>
      </div>
    </div>
  )
}
