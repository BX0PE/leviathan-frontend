import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'

function plural(n) {
  return n === 1 ? 'ieraksts izveidots' : 'ieraksti izveidoti'
}

export default function SubmitStatus() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const ok = state?.ok !== false
  const synced = state?.synced !== false
  const count = state?.count ?? 0
  const reason = state?.reason

  let icon, title, body, accent
  if (!ok) {
    icon = '✕'
    title = 'Kļūda'
    body = state?.message || 'Neizdevās nosūtīt datus.'
    accent = 'text-danger border-danger'
  } else if (synced) {
    icon = '✓'
    title = 'Nosūtīts'
    body = `${count} ${plural(count)} BIS`
    accent = 'text-go border-go'
  } else {
    icon = '↑'
    title = 'Saglabāts'
    body = reason || 'Dati saglabāti lokāli un tiks nosūtīti uz BIS automātiski, kad atjaunosies savienojums.'
    accent = 'text-caution border-caution'
  }

  return (
    <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center px-6 text-center">
      <span className="absolute top-4 left-4 text-[10px] font-mono text-white/20 tracking-widest select-none uppercase">Statuss</span>

      {/* Big status icon */}
      <div className={`w-20 h-20 border-2 flex items-center justify-center text-4xl font-mono font-bold mb-6 ${accent}`}>
        {icon}
      </div>

      <h1 className="font-display font-bold text-2xl text-white tracking-widest uppercase mb-3">{title}</h1>
      <p className="font-mono text-sm text-white/50 mb-10 max-w-xs leading-relaxed tracking-wide">{body}</p>

      <div className="w-full max-w-xs">
        <Button variant="primary" onClick={() => navigate('/cases')}>
          Uz sākumu
        </Button>
      </div>
    </div>
  )
}
