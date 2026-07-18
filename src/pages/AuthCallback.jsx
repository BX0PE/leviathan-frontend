import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveToken, exchangePkceCode } from '../api/auth.js'
import { acceptInvite } from '../api/invites.js'
import { client } from '../api/client.js'

function afterSave(token, navigate) {
  saveToken(token)
  const pendingInvite = localStorage.getItem('leviathan_pending_invite')
  if (pendingInvite) {
    localStorage.removeItem('leviathan_pending_invite')
    acceptInvite(pendingInvite)
      .catch(() => {})
      .finally(() => navigate('/role-select', { replace: true }))
  } else {
    navigate('/role-select', { replace: true })
  }
}

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    const token = params.get('token')
    const code  = params.get('code')
    const error = params.get('error')

    if (error) {
      setErrorMsg(`BIS atteica pieeju: ${params.get('error_description') || error}`)
      return
    }

    if (token) {
      // Старый flow: backend уже обменял code → наш JWT, дал нам его напрямую
      afterSave(token, navigate)
      return
    }

    if (code) {
      // PKCE flow: браузер сам обменивает code → BIS токен → шлём на наш бэкенд
      ;(async () => {
        try {
          // 1. Браузер обменивает code на access_token (browser → BIS, не Railway)
          const bisTokens = await exchangePkceCode(code)

          // 2. Передаём токены нашему бэкенду — он создаст/найдёт пользователя
          const { data } = await client.post('/auth/pkce-tokens', {
            access_token:  bisTokens.access_token,
            refresh_token: bisTokens.refresh_token ?? null,
            expires_in:    bisTokens.expires_in    ?? 7200,
            bis_sub:       bisTokens.bis_sub        ?? null,
            bis_email:     bisTokens.bis_email      ?? null,
            bis_name:      bisTokens.bis_name       ?? null,
          })

          afterSave(data.token, navigate)
        } catch (e) {
          setErrorMsg(e.message || 'Autorizācijas kļūda')
        }
      })()
      return
    }

    // Ничего нет — обратно на логин
    navigate('/login', { replace: true })
  }, [params, navigate])

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center px-6 text-white">
        <p className="font-mono text-sm text-danger text-center mb-6">{errorMsg}</p>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="font-mono text-xs text-white/40 tracking-widest uppercase hover:text-white/70 transition"
        >
          ← Atpakaļ uz pieteikšanos
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center">
      <span className="absolute top-4 left-4 text-[10px] font-mono text-white/20 tracking-widest select-none uppercase">BIS OAuth</span>

      <div className="flex flex-col items-center gap-4">
        <div className="w-48 h-[2px] bg-concrete-dim overflow-hidden">
          <div className="h-full bg-brand animate-[loading_1.2s_ease-in-out_infinite]" />
        </div>
        <p className="font-mono text-[11px] text-white/30 tracking-widest uppercase">
          Pieslēdzamies…
        </p>
      </div>

      <style>{`
        @keyframes loading {
          0%   { width: 0%;   margin-left: 0% }
          50%  { width: 60%;  margin-left: 20% }
          100% { width: 0%;   margin-left: 100% }
        }
      `}</style>
    </div>
  )
}
