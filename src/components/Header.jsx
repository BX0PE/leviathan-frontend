import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Header({ title, onBack, right }) {
  const navigate = useNavigate()
  const isHome = title === 'LEVIATHAN'

  return (
    <header className="bg-asphalt text-white sticky top-0 z-10">
      <div className="flex items-center gap-3 px-4 min-h-tap py-2">
        {onBack && (
          <button
            onClick={() => (onBack === true ? navigate(-1) : onBack())}
            aria-label="Atpakaļ"
            className="min-h-tap min-w-[48px] -ml-2 flex items-center justify-center text-2xl"
          >
            ←
          </button>
        )}
        {isHome
          ? <img src={logo} alt="LEVIATHAN" className="h-8 select-none flex-1" draggable={false} />
          : <h1 className="font-display font-semibold text-lg tracking-wide truncate flex-1">{title}</h1>
        }
        {right}
      </div>
    </header>
  )
}
