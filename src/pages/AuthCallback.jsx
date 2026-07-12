import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveToken } from '../api/auth.js'

// The backend itself handles the BIS OAuth exchange server-side and
// redirects here with a short-lived token in the query string, since
// this is a static SPA with nowhere else to receive it.
export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      saveToken(token)
      navigate('/role-select', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [params, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-asphalt text-white">
      <p className="font-display tracking-wide">Pieslēdzamies…</p>
    </div>
  )
}
