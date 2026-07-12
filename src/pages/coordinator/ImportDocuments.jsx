import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Button from '../../components/Button.jsx'
import { importDocuments } from '../../api/coordinator.js'

const CONFIDENCE_LABEL = {
  exact:   { text: 'Точное',     color: 'text-go   bg-go/10' },
  partial: { text: 'Частичное',  color: 'text-caution bg-caution/10' },
  none:    { text: 'Не найдено', color: 'text-danger bg-danger/10' },
}

export default function ImportDocuments() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function handleFiles(incoming) {
    const pdfs = Array.from(incoming).filter((f) => f.name.match(/\.pdf$/i))
    if (pdfs.length === 0) { setError('Только PDF файлы'); return }
    setFiles(pdfs)
    setError(null)
    setResult(null)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  async function handleUpload() {
    if (files.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const data = await importDocuments(id, files)
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title="Загрузить документы" onBack />

      <div className="px-4 pt-4 flex flex-col gap-4">
        <p className="text-sm text-asphalt-soft">
          Загрузи паспорта и сертификаты (atbilstības dokumenti). Система автоматически сопоставит их с позициями сметы.
        </p>

        {/* Зона загрузки */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-card px-6 py-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-brand bg-brand/5' : 'border-concrete-dim bg-card'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className="text-4xl mb-3">📄</p>
          {files.length > 0
            ? <p className="font-semibold text-asphalt">{files.length} файл{files.length > 1 ? 'а' : ''} выбрано</p>
            : <p className="text-asphalt-soft">Перетащи PDF-файлы или нажми</p>
          }
          <p className="text-xs text-asphalt-soft mt-1">Можно сразу несколько</p>
        </div>

        {files.length > 0 && !result && (
          <div className="bg-card rounded-card px-4 py-3 flex flex-col gap-1">
            {files.map((f, i) => (
              <p key={i} className="text-sm text-asphalt truncate">📄 {f.name}</p>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-danger bg-danger/10 rounded-card px-4 py-3">{error}</p>}

        {!result && (
          <Button variant="primary" onClick={handleUpload} disabled={files.length === 0 || loading}>
            {loading ? `Обрабатываем ${files.length} файл…` : `Загрузить ${files.length > 0 ? files.length + ' PDF' : ''}`}
          </Button>
        )}

        {/* Результат */}
        {result && (
          <div className="flex flex-col gap-3">
            <div className="bg-card rounded-card shadow-sm px-4 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✅</span>
                <p className="font-semibold text-asphalt">Обработано {result.processed} документов</p>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-xl text-go">{result.matched}</p>
                  <p className="text-asphalt-soft text-xs">привязано</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl text-caution">{result.unmatched}</p>
                  <p className="text-asphalt-soft text-xs">не найдено</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl text-danger">{result.errors}</p>
                  <p className="text-asphalt-soft text-xs">ошибок</p>
                </div>
              </div>
            </div>

            {result.results?.map((r, i) => {
              const conf = CONFIDENCE_LABEL[r.confidence] || CONFIDENCE_LABEL.none
              return (
                <div key={i} className="bg-card rounded-card shadow-sm px-4 py-3">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-sm text-asphalt flex-1 mr-2 truncate">{r.filename}</p>
                    {r.status !== 'error' && r.status !== 'skipped' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${conf.color}`}>
                        {conf.text}
                      </span>
                    )}
                  </div>
                  {r.product_name && <p className="text-xs text-asphalt-soft">{r.product_name}</p>}
                  {r.matched_position && (
                    <p className="text-xs text-go mt-1">→ {r.matched_position}</p>
                  )}
                  {r.status === 'unmatched' && (
                    <p className="text-xs text-caution mt-1">Привяжи вручную в разделе "Документы"</p>
                  )}
                  {(r.status === 'error' || r.status === 'skipped') && (
                    <p className="text-xs text-danger mt-1">{r.reason}</p>
                  )}
                </div>
              )
            })}

            <div className="flex flex-col gap-2 mt-2">
              {result.unmatched > 0 && (
                <Button variant="outline" onClick={() => navigate(`/cases/${id}/documents`)}>
                  Привязать вручную →
                </Button>
              )}
              <Button variant="primary" onClick={() => navigate(`/cases/${id}`)}>
                Вернуться к объекту
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
