import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Button from '../../components/Button.jsx'
import { createCase } from '../../api/coordinator.js'

export default function CreateCase() {
  const navigate = useNavigate()
  const [name,      setName]      = useState('')
  const [bisNumber, setBisNumber] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const c = await createCase({ name: name.trim(), bisNumber: bisNumber.trim() })
      navigate(`/cases/${c.id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Neizdevās izveidot objektu.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title="Jauns objekts" onBack />

      <form onSubmit={handleSubmit} className="px-4 pt-6 flex flex-col gap-4">

        <div className="flex flex-col gap-1">
          <label className="section-label">Objekta nosaukums *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="piem. Dzīvojamā māja, Rīgas iela 12"
            className="bg-card border border-concrete-dim px-4 py-3 text-sm text-asphalt placeholder:text-asphalt-soft/50 focus:outline-none focus:border-brand"
            autoFocus
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="section-label">BIS lietas numurs <span className="text-asphalt-soft">(neobligāts)</span></label>
          <input
            type="text"
            value={bisNumber}
            onChange={(e) => setBisNumber(e.target.value)}
            placeholder="piem. BIS-BV-5-338-23-K"
            className="bg-card border border-concrete-dim px-4 py-3 text-sm text-asphalt font-mono placeholder:text-asphalt-soft/40 focus:outline-none focus:border-brand"
          />
          <p className="font-mono text-[11px] text-asphalt-soft tracking-wide">
            Ja zini BIS lietas numuru — ieraksti. Vēlāk var sinhronizēt no BIS.
          </p>
        </div>

        {error && (
          <div className="border-l-2 border-danger bg-card px-4 py-3">
            <p className="font-mono text-sm text-danger">{error}</p>
          </div>
        )}

        <Button variant="primary" type="submit" disabled={!name.trim() || loading}>
          {loading ? 'Izveido…' : 'Izveidot objektu'}
        </Button>

      </form>
    </div>
  )
}
