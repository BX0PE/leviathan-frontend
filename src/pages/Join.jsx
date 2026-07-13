import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import logo from '../assets/logo.png'
import { fetchInvite } from '../api/invites.js'
import { goToBisLogin } from '../api/auth.js'

export default function Join() {
  const { token } = useParams()
  const navigate   = useNavigate()
  const [invite,  setInvite]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    fetchInvite(token)
      .then((data) => { setInvite(data);  setLoading(false) })
      .catch(()    => { setInvalid(true); setLoading(false) })
  }, [token])

  function handleJoin() {
    // Persist token so AuthCallback can accept it after OAuth redirect
    localStorage.setItem('leviathan_pending_invite', token)
    goToBisLogin()
  }

  return (
    <div className="min-h-screen bg-blueprint flex flex-col items-center justify-center px-6 text-white relative">
      <span className="absolute top-4 left-4 text-[10px] font-mono text-rebar/40 tracking-widest select-none uppercase">
        Ielūgums
      </span>

      <div className="w-full max-w-xs flex flex-col items-center text-center">
        <img src={logo} alt="LEVIATHAN" className="w-40 mb-8 select-none" draggable={false} />
        <div className="w-12 h-[2px] bg-brand mb-8" />

        {/* Loading */}
        {loading && (
          <p className="font-mono text-[11px] text-white/40 tracking-widest uppercase">
            Pārbauda ielūgumu…
          </p>
        )}

        {/* Invalid / expired */}
        {invalid && !loading && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="w-16 h-16 border-2 border-danger flex items-center justify-center font-mono font-bold text-3xl text-danger">
              ✕
            </div>
            <div>
              <p className="font-mono text-[11px] text-danger tracking-widest uppercase mb-2">
                Ielūgums nav derīgs
              </p>
              <p className="font-mono text-[11px] text-white/30 tracking-wide leading-relaxed">
                Saite ir novecojusi vai nepareiza.<br />
                Lūdz koordinatoram nosūtīt jaunu saiti.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="font-mono text-[11px] text-white/30 tracking-widest uppercase hover:text-white/60 transition"
            >
              ← Uz sākumu
            </button>
          </div>
        )}

        {/* Valid invite */}
        {invite && !loading && (
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Company card */}
            <div className="border border-white/10 w-full text-left">
              <div className="px-5 py-2 border-b border-white/10 bg-white/5">
                <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase">
                  Ielūgums pievienoties
                </span>
              </div>
              <div className="px-5 py-4">
                <p className="font-display font-bold text-white text-xl mb-1">
                  {invite.company_name}
                </p>
                {invite.invited_by && (
                  <p className="font-mono text-[11px] text-white/40 tracking-wide">
                    Ielūdza: {invite.invited_by}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleJoin}
              className="w-full bg-brand text-white font-mono text-[12px] tracking-widest uppercase py-4 hover:bg-brand-dark transition"
            >
              Pieteikties ar BIS un pievienoties →
            </button>

            <p className="font-mono text-[11px] text-white/20 tracking-wide leading-relaxed">
              Piesakoties, tu automātiski pievienojies<br />šī uzņēmuma komandai LEVIATHAN
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
