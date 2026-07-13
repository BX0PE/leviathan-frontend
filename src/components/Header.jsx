import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Header({ title, onBack, right }) {
  const navigate = useNavigate()
  const isHome = title === 'LEVIATHAN'

  return (
    <header className="bg-asphalt text-white sticky top-0 z-10 border-b-2 border-brand">
      <div className="flex items-center gap-3 px-4 min-h-tap py-2">
        {onBack && (
          <button
            onClick={() => (onBack === true ? navigate(-1) : onBack())}
            aria-label="Atpakaļ"
            className="min-h-tap min-w-[44px] -ml-2 flex items-center justify-center font-mono text-xl text-white/70 hover:text-white transition"
          >
            ←
          </button>
        )}
        {isHome
          ? <div className="flex-1"><img src={logo} alt="LEVIATHAN" className="h-7 select-none mix-blend-screen" draggable={false} /></div>
          : <h1 className="font-display font-semibold text-base tracking-wider uppercase truncate flex-1">{title}</h1>
        }
        {right}
      </div>
    </header>
  )
}
