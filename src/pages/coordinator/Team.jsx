import { useEffect, useState } from 'react'
import Header from '../../components/Header.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { client } from '../../api/client.js'
import { createInvite } from '../../api/invites.js'
import { useToast } from '../../components/Toast.jsx'

const ROLE_LABEL = {
  coordinator: 'Koordinators',
  foreman:     'Priekšnieks',
  supervisor:  'Uzraugs',
}

/* ─── Avatar ─────────────────────────────────────────────────── */
function Avatar({ name, email }) {
  const letter = (name || email || '?')[0].toUpperCase()
  return (
    <div className="w-9 h-9 bg-concrete border border-concrete-dim flex items-center justify-center font-mono font-bold text-sm text-asphalt-soft shrink-0">
      {letter}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Team() {
  const toast = useToast()

  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [inviteUrl,  setInviteUrl]  = useState(null)
  const [generating, setGenerating] = useState(false)
  const [copied,     setCopied]     = useState(false)

  useEffect(() => {
    let cancelled = false
    client.get('/team/members')
      .then((r) => { if (!cancelled) { setMembers(r.data); setLoading(false) } })
      .catch(()  => { if (!cancelled) { setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const { token } = await createInvite()
      setInviteUrl(`${window.location.origin}/join/${token}`)
    } catch {
      toast.add({ type: 'error', message: 'Neizdevās izveidot ielūgumu. Mēģini vēlreiz.' })
    }
    setGenerating(false)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      toast.add({ type: 'success', message: 'Saite nokopēta' })
    } catch {
      toast.add({ type: 'error', message: 'Neizdevās nokopēt' })
    }
  }

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title="Komanda" onBack />

      <div className="px-4 pt-5 flex flex-col gap-5">

        {/* ── Invite generator ── */}
        <div className="bg-card border border-concrete-dim">
          <div className="px-4 py-3 border-b border-concrete-dim">
            <div className="section-label">Uzaicināt dalībnieku</div>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            <p className="font-mono text-[11px] text-asphalt-soft tracking-wide leading-relaxed">
              Izveido ielūguma saiti un nosūti to priekšniekam vai uzraugam
              pa WhatsApp vai e-pastu. Saite ir derīga <b className="text-asphalt">7 dienas</b>.
            </p>

            {!inviteUrl ? (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-brand text-white font-mono text-[12px] tracking-widest uppercase py-3 hover:bg-brand-dark transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {generating ? 'Veido saiti…' : 'Izveidot ielūguma saiti →'}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Link row */}
                <div className="flex items-stretch border border-concrete-dim bg-concrete">
                  <p className="font-mono text-[11px] text-asphalt px-3 py-3 flex-1 truncate min-w-0">
                    {inviteUrl}
                  </p>
                  <button
                    onClick={handleCopy}
                    className={`px-4 font-mono text-[11px] tracking-widest uppercase border-l border-concrete-dim shrink-0 transition ${
                      copied
                        ? 'text-go bg-go/10'
                        : 'text-asphalt-soft hover:text-asphalt hover:bg-white'
                    }`}
                  >
                    {copied ? '✓ Nokopēts' : 'Kopēt'}
                  </button>
                </div>

                <p className="font-mono text-[10px] text-asphalt-soft/60 tracking-wide">
                  Nosūti saiti pa WhatsApp, Telegram vai e-pastu
                </p>

                <button
                  onClick={() => setInviteUrl(null)}
                  className="font-mono text-[10px] text-asphalt-soft tracking-widest uppercase hover:text-asphalt transition self-start"
                >
                  Izveidot jaunu saiti →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Members list ── */}
        <div className="bg-card border border-concrete-dim">
          <div className="px-4 py-3 border-b border-concrete-dim flex items-center justify-between">
            <div className="section-label">Komandas locekļi</div>
            {!loading && members.length > 0 && (
              <span className="font-mono text-[11px] text-asphalt-soft">{members.length}</span>
            )}
          </div>

          {loading && (
            <div className="px-4 py-4 flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 bg-concrete-dim/60 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3.5 w-24 bg-concrete-dim/60 mb-1.5" />
                    <div className="h-2.5 w-16 bg-concrete-dim/40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && members.length === 0 && (
            <EmptyState
              icon="👥"
              title="Komanda ir tukša"
              description="Uzaicini priekšnieku vai uzraugu, izmantojot ielūguma saiti"
            />
          )}

          <div className="divide-y divide-concrete-dim">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={m.name} email={m.email} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-asphalt truncate">
                    {m.name || m.email}
                  </p>
                  <p className="font-mono text-[10px] text-asphalt-soft tracking-widest uppercase mt-0.5">
                    {ROLE_LABEL[m.role] || m.role}
                  </p>
                </div>
                {m.joined_at && (
                  <span className="font-mono text-[10px] text-asphalt-soft/50 shrink-0">
                    {new Date(m.joined_at).toLocaleDateString('lv-LV', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
