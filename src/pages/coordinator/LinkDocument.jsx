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
      const found = docs.find((d) => String(d.id) === String(docId))
      setDoc(found || null)
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
      <Header title="Привязать документ" onBack />
      <p className="px-4 pt-6 text-asphalt-soft">Загружаем…</p>
    </div>
  )

  if (!doc) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Ошибка" onBack />
      <p className="px-4 pt-6 text-danger">Документ не найден</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-concrete pb-32">
      <Header title="Привязать документ" onBack />

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* Инфо о документе */}
        <div className="bg-card rounded-card shadow-sm px-4 py-3">
          <p className="text-xs text-asphalt-soft uppercase tracking-wider mb-1">Документ</p>
          <p className="font-semibold text-asphalt">📄 {doc.filename}</p>
          {doc.product_name && <p className="text-sm text-asphalt-soft mt-0.5">{doc.product_name}</p>}
          {doc.manufacturer  && <p className="text-sm text-asphalt-soft">{doc.manufacturer}</p>}
          {doc.dop_number    && <p className="text-xs text-asphalt-soft mt-1">DoP: {doc.dop_number}</p>}
        </div>

        {/* Поиск позиции */}
        <div>
          <p className="text-xs text-asphalt-soft uppercase tracking-wider mb-2">Выбери позицию сметы</p>
          <input
            type="text"
            placeholder="Поиск по названию…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-card border border-concrete-dim rounded-card px-4 py-2 text-sm text-asphalt placeholder-asphalt-soft outline-none focus:border-brand mb-3"
          />

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-asphalt-soft text-center py-4">Ничего не найдено</p>
            )}
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`text-left px-4 py-3 rounded-card border transition-colors min-h-tap ${
                  selected === p.id
                    ? 'border-brand bg-brand/5'
                    : 'border-concrete-dim bg-card'
                }`}
              >
                <p className="text-sm font-medium text-asphalt">{p.name}</p>
                {p.group && (
                  <p className="text-xs text-asphalt-soft mt-0.5">{p.group}</p>
                )}
                {p.unit && (
                  <p className="text-xs text-asphalt-soft">{p.quantity_planned} {p.unit}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger bg-danger/10 rounded-card px-4 py-3">{error}</p>}
      </div>

      {/* Кнопка фиксированная снизу */}
      <div className="fixed bottom-0 inset-x-0 bg-concrete border-t border-concrete-dim px-4 py-3">
        <Button variant="primary" onClick={handleSave} disabled={!selected || saving}>
          {saving ? 'Сохраняем…' : selected ? 'Привязать к выбранной позиции' : 'Выбери позицию'}
        </Button>
      </div>
    </div>
  )
}
