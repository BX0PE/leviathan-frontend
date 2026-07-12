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
    title = 'Ошибка'
    body = state?.message || 'Не удалось отправить данные.'
    tone = 'text-danger'
  } else if (synced) {
    icon = '✅'
    title = 'Отправлено!'
    body = `${count} ${plural(count)} создано в BIS`
    tone = 'text-go'
  } else {
    icon = '📶'
    title = 'Сохранено офлайн'
    body = 'Данные сохранены локально и отправятся в BIS автоматически при восстановлении связи.'
    tone = 'text-caution'
  }

  return (
    <div className="min-h-screen bg-asphalt text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">{icon}</div>
      <h1 className={`font-display font-bold text-2xl mb-3 ${ok ? '' : ''}`}>{title}</h1>
      <p className="text-concrete-dim mb-10 leading-relaxed max-w-xs">{body}</p>
      <div className="w-full max-w-xs">
        <Button variant="primary" onClick={() => navigate('/cases')}>
          На главную
        </Button>
      </div>
    </div>
  )
}

function plural(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'запись'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'записи'
  return 'записей'
}
