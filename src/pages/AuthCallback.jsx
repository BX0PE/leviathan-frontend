import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveToken } from '../api/auth.js'
import { acceptInvite } from '../api/invites.js'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      saveToken(token)

      // If user came via an invite link, accept it now
      const pendingInvite = localStorage.getItem('leviathan_pending_invite')
      if (pendingInvite) {
        localStorage.removeItem('leviathan_pending_invite')
        acceptInvite(pendingInvite)
          .catch(() => {}) // don't block login if this fails
          .finally(() => navigate('/role-select', { replace: true }))
      } else {
        navigate('/role-select', { replace: true })
      }
    } else {
      navigate('/login', { replace: true })
    }
  }, [params, navigate])

  return (
    <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center">
      <span className="absolute top-4 left-4 text-[10px] font-mono text-white/20 tracking-widest select-none uppercase">BIS OAuth</span>

      <div className="flex flex-col items-center gap-4">
        {/* Animated orange bar */}
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
