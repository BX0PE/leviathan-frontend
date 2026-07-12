import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Button from '../../components/Button.jsx'
import { importEstimate } from '../../api/coordinator.js'

export default function ImportEstimate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function handleFile(f) {
    if (!f) return
    if (!f.name.match(/\.(xlsx|xls)$/i)) {
      setError('Tikai Excel faili (.xlsx, .xls)')
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const data = await importEstimate(id, file)
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title="Augšupielādēt tāmi" onBack />

      <div className="px-4 pt-4 flex flex-col gap-4">
        <p className="text-sm text-asphalt-soft">
          Formāts: Excel LBN 501-17 (daudzlapu). Pozīcijas tiks automātiski izveidotas sistēmā.
        </p>

        {/* Augšupielādes zona */}
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
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <p className="text-4xl mb-3">📊</p>
          {file
            ? <p className="font-semibold text-asphalt">{file.name}</p>
            : <p className="text-asphalt-soft">Velc failu šeit vai nospied</p>
          }
          <p className="text-xs text-asphalt-soft mt-1">.xlsx / .xls</p>
        </div>

        {error && <p className="text-sm text-danger bg-danger/10 rounded-card px-4 py-3">{error}</p>}

        {!result && (
          <Button variant="primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Apstrādājam tāmi…' : 'Augšupielādēt'}
          </Button>
        )}

        {/* Rezultāts */}
        {result && (
          <div className="bg-card rounded-card shadow-sm px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-asphalt">Tāme augšupielādēta</p>
                <p className="text-xs text-asphalt-soft">{result.filename} · {result.sheets_processed?.length || 0} lapas</p>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-xl text-brand">{result.positions_created}</p>
                <p className="text-asphalt-soft text-xs">izveidots</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-asphalt">{result.positions_updated}</p>
                <p className="text-asphalt-soft text-xs">atjaunots</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-asphalt">{result.total}</p>
                <p className="text-asphalt-soft text-xs">kopā</p>
              </div>
            </div>

            {result.preview?.length > 0 && (
              <div>
                <p className="text-xs text-asphalt-soft uppercase tracking-wider mb-2">Pirmās pozīcijas</p>
                {result.preview.map((p, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-concrete-dim last:border-b-0 text-sm">
                    <span className="text-asphalt">{p.nr} · {p.name}</span>
                    <span className="font-mono text-asphalt-soft">{p.quantity} {p.unit}</span>
                  </div>
                ))}
              </div>
            )}

            <Button variant="outline" onClick={() => navigate(`/cases/${id}`)}>
              Atgriezties pie objekta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
