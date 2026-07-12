import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'

export default function SubmitStatus() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const ok = state?.ok !== false
  const synced = state?.synced !== false
  const count = state?.count ?? 0

  let icon, title, body, tone
  if (!ok) {
    icon = '❌'
    title = 'Kļūda'
    body = state?.message || 'Neizdevās nosūtīt datus.'
    tone = 'text-danger'
  } else if (synced) {
    icon = '✅'
    title = 'Nosūtīts!'
    body = `${count} ${plural(count)} BIS`
    tone = 'text-go'
  } else {
    icon = '📶'
    title = 'Saglabāts bezsaistē'
    body = 'Dati saglabāti lokāli un tiks nosūtīti uz BIS automātiski, kad atjaunosies savienojums.'
    tone = 'text-caution'
  }

  return (
    <div className="min-h-screen bg-asphalt text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">{icon}</div>
      <h1 className={`font-display font-bold text-2xl mb-3 ${ok ? '' : ''}`}>{title}</h1>
      <p className="text-concrete-dim mb-10 leading-relaxed max-w-xs">{body}</p>
      <div className="w-full max-w-xs">
        <Button variant="primary" onClick={() => navigate('/cases')}>
          Uz sākumu
        </Button>
      </div>
    </div>
  )
}

function plural(n) {
  return n === 1 ? 'ieraksts izveidots' : 'ieraksti izveidoti'
}
