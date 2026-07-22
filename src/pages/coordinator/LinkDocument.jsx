import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Button from '../../components/Button.jsx'
import { fetchDocuments, linkDocument } from '../../api/coordinator.js'
import { fetchPositions } from '../../api/cases.js'

export default function LinkDocument() {
  const { docId } = useParams()
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('case')
  const navigate = useNavigate()

  const [doc, setDoc] = useState(null)
  const [positions, setPositions] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!caseId) return
    Promise.all([fetchDocuments(caseId), fetchPositions(caseId)]).then(([docs, pos]) => {
      setDoc(docs.find((d) => String(d.id) === String(docId)) || null)
      setPositions(pos)
      setLoading(false)
    })
  }, [docId, caseId])

  const filtered = positions.filter((p) =>
    !query || p.name.toLowerCase().includes(query.toLowerCase())
  )

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      await linkDocument(Number(docId), selected)
      navigate(`/cases/${caseId}/documents`, { replace: true })
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Piesaistīt dokumentu" onBack />
      <div className="px-4 pt-5 flex flex-col gap-3">
        <div className="bg-card border border-concrete-dim p-4 animate-pulse">
          <div className="h-3 w-2/3 bg-concrete-dim/60 mb-2" />
          <div className="h-3 w-1/2 bg-concrete-dim/40" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-card border border-concrete-dim px-4 py-3 animate-pulse">
            <div className="h-3 w-3/4 bg-concrete-dim/60 mb-1.5" />
            <div className="h-2.5 w-1/3 bg-concrete-dim/40" />
          </div>
        ))}
      </div>
    </div>
  )

  if (!doc) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Kļūda" onBack />
      <p className="px-4 pt-6 font-mono text-sm text-danger">Dokuments nav atrasts</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-concrete pb-32">
      <Header title="Piesaistīt dokumentu" onBack />

      <div className="px-4 pt-5 flex flex-col gap-4">

        {/* Doc info */}
        <div className="bg-card border border-concrete-dim">
          <div className="px-4 py-2 border-b border-concrete-dim">
            <div className="section-label">Dokuments</div>
          </div>
          <div className="px-4 py-3">
            <p className="font-mono text-[12px] text-asphalt font-semibold">📄 {doc.filename}</p>
            {doc.product_name && <p className="text-sm text-asphalt-soft mt-1">{doc.product_name}</p>}
            {doc.manufacturer  && <p className="text-sm text-asphalt-soft">{doc.manufacturer}</p>}
            {doc.dop_number    && <p className="font-mono text-[11px] text-asphalt-soft mt-1">DoP: {doc.dop_number}</p>}
          </div>
        </div>

        {/* Search */}
        <div>
          <div className="section-label mb-3">Izvēlies tāmes pozīciju</div>
          <input
            type="text"
            placeholder="Meklēt pēc nosaukuma…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-2 border-concrete-dim bg-card px-4 py-2.5 text-sm text-asphalt placeholder-asphalt-soft outline-none focus:border-brand transition-colors mb-3 font-mono"
          />

          <div className="bg-card border border-concrete-dim divide-y divide-concrete-dim max-h-96 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="px-4 py-6 font-mono text-sm text-asphalt-soft text-center tracking-wide">
                Nekas nav atrasts
              </p>
            )}
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`w-full text-left flex items-stretch min-h-tap transition-colors ${
                  selected === p.id ? 'bg-brand/5' : 'hover:bg-concrete'
                }`}
              >
                <div className={`w-[3px] shrink-0 ${selected === p.id ? 'bg-brand' : 'bg-transparent'}`} />
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-asphalt">{p.name}</p>
                  {p.group && <p className="font-mono text-[11px] text-asphalt-soft tracking-wide mt-0.5">{p.group}</p>}
                  {p.unit && <p className="font-mono text-[11px] text-asphalt-soft">{p.quantity_planned} {p.unit}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="border-l-2 border-danger bg-card px-4 py-3">
            <p className="font-mono text-sm text-danger">{error}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-concrete-dim px-4 py-3">
        <Button variant="primary" onClick={handleSave} disabled={!selected || saving}>
          {saving ? 'Saglabājam…' : selected ? 'Piesaistīt izvēlētajai pozīcijai' : 'Izvēlies pozīciju'}
        </Button>
      </div>
    </div>
  )
}
