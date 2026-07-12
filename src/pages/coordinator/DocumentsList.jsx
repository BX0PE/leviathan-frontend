import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import { fetchDocuments } from '../../api/coordinator.js'

const CONF_BADGE = {
  exact:   'text-go bg-go/10',
  partial: 'text-caution bg-caution/10',
  manual:  'text-brand bg-brand/10',
  none:    'text-danger bg-danger/10',
}

const CONF_LABEL = {
  exact:   'Auto precīzs',
  partial: 'Auto daļējs',
  manual:  'Manuāli',
  none:    'Nav piesaistīts',
}

export default function DocumentsList() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchDocuments(id).then((data) => {
      if (!cancelled) { setDocs(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [id])

  const unmatched = docs.filter((d) => !d.estimate_position_id)
  const matched   = docs.filter((d) =>  d.estimate_position_id)

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title="Objekta dokumenti" onBack />

      <div className="px-4 pt-4 flex flex-col gap-4">
        {loading && <p className="text-asphalt-soft">Ielādējam…</p>}

        {!loading && docs.length === 0 && (
          <div className="bg-card rounded-card shadow-sm px-4 py-8 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-asphalt">Dokumentu nav</p>
            <p className="text-sm text-asphalt-soft mt-1">Augšupielādē PDF ar pogu objekta lapā</p>
          </div>
        )}

        {/* Nav piesaistīti — nepieciešama uzmanība */}
        {unmatched.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-danger mb-2">
              ⚠ Nav piesaistīti ({unmatched.length})
            </h2>
            <div className="flex flex-col gap-2">
              {unmatched.map((d) => (
                <DocCard key={d.id} doc={d} caseId={id} onNavigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* Piesaistīti */}
        {matched.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-rebar mb-2">
              Piesaistīti ({matched.length})
            </h2>
            <div className="flex flex-col gap-2">
              {matched.map((d) => (
                <DocCard key={d.id} doc={d} caseId={id} onNavigate={navigate} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DocCard({ doc, caseId, onNavigate }) {
  const conf = doc.match_confidence || 'none'
  return (
    <div className="bg-card rounded-card shadow-sm px-4 py-3">
      <div className="flex justify-between items-start mb-1">
        <p className="font-medium text-sm text-asphalt flex-1 mr-2 truncate">📄 {doc.filename}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${CONF_BADGE[conf]}`}>
          {CONF_LABEL[conf]}
        </span>
      </div>
      {doc.product_name && <p className="text-xs text-asphalt-soft">{doc.product_name}</p>}
      {doc.manufacturer  && <p className="text-xs text-asphalt-soft">{doc.manufacturer}</p>}
      {doc.dop_number    && <p className="text-xs text-asphalt-soft">DoP: {doc.dop_number}</p>}
      {!doc.estimate_position_id && (
        <button
          onClick={() => onNavigate(`/documents/${doc.id}/link?case=${caseId}`)}
          className="mt-2 text-xs text-brand underline underline-offset-2"
        >
          Piesaistīt manuāli →
        </button>
      )}
    </div>
  )
}
