import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { fetchDocuments } from '../../api/coordinator.js'

const CONF_BADGE = {
  high:    'text-go',
  exact:   'text-go',
  medium:  'text-caution',
  partial: 'text-caution',
  low:     'text-caution',
  manual:  'text-rebar',
  none:    'text-danger',
}
const CONF_LABEL = {
  high:    'Auto precīzs',
  exact:   'Auto precīzs',
  medium:  'Auto daļējs',
  partial: 'Auto daļējs',
  low:     'Auto vājš',
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

      <div className="px-4 pt-5 flex flex-col gap-4">
        {loading && <p className="font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam…</p>}

        {!loading && docs.length === 0 && (
          <div className="bg-card border border-concrete-dim">
            <EmptyState
              icon="📭"
              title="Dokumentu nav"
              description="Augšupielādē PDF pases un sertifikātus objekta lapā"
              action="Augšupielādēt dokumentus"
              onAction={() => navigate(`/cases/${id}/import-documents`)}
            />
          </div>
        )}

        {unmatched.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-[3px] h-4 bg-danger" />
              <span className="text-[11px] font-mono text-danger tracking-widest uppercase font-semibold">
                Nav piesaistīti ({unmatched.length})
              </span>
            </div>
            <div className="bg-card border border-danger/30 divide-y divide-concrete-dim">
              {unmatched.map((d) => <DocRow key={d.id} doc={d} caseId={id} onNavigate={navigate} />)}
            </div>
          </div>
        )}

        {matched.length > 0 && (
          <div>
            <div className="section-label mb-2">Piesaistīti ({matched.length})</div>
            <div className="bg-card border border-concrete-dim divide-y divide-concrete-dim">
              {matched.map((d) => <DocRow key={d.id} doc={d} caseId={id} onNavigate={navigate} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DocRow({ doc, caseId, onNavigate }) {
  const conf = doc.match_confidence || 'none'
  return (
    <div className="px-4 py-3">
      <div className="flex justify-between items-start">
        <p className="font-mono text-[12px] text-asphalt flex-1 mr-3 truncate">📄 {doc.filename}</p>
        <span className={`font-mono text-[11px] whitespace-nowrap ${CONF_BADGE[conf]}`}>
          {CONF_LABEL[conf]}
        </span>
      </div>
      {doc.product_name && <p className="text-[12px] text-asphalt-soft mt-0.5">{doc.product_name}</p>}
      {doc.manufacturer  && <p className="text-[12px] text-asphalt-soft">{doc.manufacturer}</p>}
      {doc.dop_number    && <p className="font-mono text-[11px] text-asphalt-soft mt-0.5">DoP: {doc.dop_number}</p>}
      {!doc.estimate_position_id && (
        <button
          onClick={() => onNavigate(`/documents/${doc.id}/link?case=${caseId}`)}
          className="mt-2 font-mono text-[11px] text-rebar tracking-widest uppercase underline underline-offset-2"
        >
          Piesaistīt manuāli →
        </button>
      )}
    </div>
  )
}
