import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Button from '../../components/Button.jsx'
import { importDocuments } from '../../api/coordinator.js'

const CONF = {
  high:    { text: 'Precīzs',     cls: 'text-go bg-go/10' },
  exact:   { text: 'Precīzs',     cls: 'text-go bg-go/10' },
  medium:  { text: 'Daļējs',      cls: 'text-caution bg-caution/10' },
  partial: { text: 'Daļējs',      cls: 'text-caution bg-caution/10' },
  low:     { text: 'Vājš',        cls: 'text-caution bg-caution/10' },
  manual:  { text: 'Manuāli',     cls: 'text-brand bg-brand/10' },
  none:    { text: 'Nav atrasts', cls: 'text-danger bg-danger/10' },
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
    if (pdfs.length === 0) { setError('Tikai PDF faili'); return }
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
      <Header title="Augšupielādēt dokumentus" onBack />

      <div className="px-4 pt-5 flex flex-col gap-4">

        <p className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase">
          PDF pases un sertifikāti · Atbilstības dokumenti
        </p>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all duration-200 active:scale-[0.99] ${
            dragging ? 'border-brand bg-brand/5 scale-[1.01]' : 'border-concrete-dim bg-card hover:border-asphalt-soft hover:bg-concrete'
          }`}
        >
          <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files)} />
          <p className="text-3xl mb-3">📄</p>
          {files.length > 0
            ? <p className="font-semibold text-sm text-asphalt">Izvēlēti: {files.length} PDF</p>
            : <p className="font-mono text-sm text-asphalt-soft">Velc PDF failus šeit vai nospied</p>
          }
          <p className="font-mono text-[11px] text-asphalt-soft/60 tracking-widest uppercase mt-2">Var izvēlēties vairākus</p>
        </div>

        {files.length > 0 && !result && (
          <div className="bg-card border border-concrete-dim">
            {files.map((f, i) => (
              <p key={i} className="px-4 py-2 text-sm text-asphalt border-b border-concrete-dim last:border-b-0 truncate font-mono text-[12px]">
                📄 {f.name}
              </p>
            ))}
          </div>
        )}

        {error && (
          <div className="border-l-2 border-danger bg-card px-4 py-3">
            <p className="font-mono text-sm text-danger">{error}</p>
          </div>
        )}

        {!result && (
          <Button variant="primary" onClick={handleUpload} disabled={files.length === 0 || loading}>
            {loading ? `Apstrādājam ${files.length} failu…` : `Augšupielādēt${files.length > 0 ? ' ' + files.length + ' PDF' : ''}`}
          </Button>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-3">
            <div className="bg-card border border-concrete-dim">
              <div className="px-4 py-3 border-b border-concrete-dim flex items-center gap-3">
                <span className="text-go font-mono text-lg">✓</span>
                <p className="font-semibold text-sm text-asphalt">Apstrādāti {result.processed} dokumenti</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-concrete-dim">
                {[
                  { val: result.matched,   label: 'piesaistīti', cls: 'text-go' },
                  { val: result.unmatched, label: 'nav atrasti',  cls: 'text-caution' },
                  { val: result.errors,    label: 'kļūdas',       cls: 'text-danger' },
                ].map(({ val, label, cls }) => (
                  <div key={label} className="px-4 py-3 text-center">
                    <p className={`font-mono font-bold text-xl ${cls}`}>{val}</p>
                    <p className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {result.results?.map((r, i) => {
              const conf = CONF[r.confidence] || CONF.none
              return (
                <div key={i} className="bg-card border border-concrete-dim">
                  <div className="flex justify-between items-center px-4 py-2.5 border-b border-concrete-dim">
                    <p className="font-mono text-[12px] text-asphalt truncate flex-1 mr-2">{r.filename}</p>
                    {r.status !== 'error' && r.status !== 'skipped' && (
                      <span className={`text-[11px] px-2 py-0.5 font-mono font-medium whitespace-nowrap ${conf.cls}`}>
                        {conf.text}
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-2">
                    {r.product_name && <p className="text-[12px] text-asphalt-soft">{r.product_name}</p>}
                    {r.matched_position && <p className="font-mono text-[11px] text-go mt-1">→ {r.matched_position}</p>}
                    {r.status === 'unmatched' && (
                      <p className="font-mono text-[11px] text-caution mt-1">Piesaisti manuāli sadaļā "Dokumenti"</p>
                    )}
                    {(r.status === 'error' || r.status === 'skipped') && (
                      <p className="font-mono text-[11px] text-danger mt-1">{r.reason}</p>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="flex flex-col gap-2 mt-1">
              {result.unmatched > 0 && (
                <Button variant="outline" onClick={() => navigate(`/cases/${id}/documents`)}>
                  Piesaistīt manuāli →
                </Button>
              )}
              <Button variant="primary" onClick={() => navigate(`/cases/${id}`)}>
                Atgriezties pie objekta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
