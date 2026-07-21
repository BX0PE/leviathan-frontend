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

      <div className="px-4 pt-5 flex flex-col gap-4">

        <p className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase">
          Formāts: Excel LBN 501-17 · Daudzlapu
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
          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
          <p className="text-3xl mb-3">📊</p>
          {file
            ? <p className="font-semibold text-sm text-asphalt">{file.name}</p>
            : <p className="font-mono text-sm text-asphalt-soft">Velc failu šeit vai nospied</p>
          }
          <p className="font-mono text-[11px] text-asphalt-soft/60 tracking-widest uppercase mt-2">.xlsx / .xls</p>
        </div>

        {error && (
          <div className="border-l-2 border-danger bg-card px-4 py-3">
            <p className="font-mono text-sm text-danger">{error}</p>
          </div>
        )}

        {!result && (
          <Button variant="primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Apstrādājam…' : 'Augšupielādēt'}
          </Button>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col gap-3">
            <div className="bg-card border border-concrete-dim">
              <div className="px-4 py-3 border-b border-concrete-dim flex items-center gap-3">
                <span className="text-go font-mono text-lg">✓</span>
                <div>
                  <p className="font-semibold text-sm text-asphalt">Tāme augšupielādēta</p>
                  <p className="font-mono text-[11px] text-asphalt-soft tracking-wide">
                    {result.filename} · {result.sheets_processed?.length || 0} lapas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-concrete-dim">
                {[
                  { val: result.positions_created, label: 'izveidots' },
                  { val: result.positions_updated, label: 'atjaunots' },
                  { val: result.total,             label: 'kopā' },
                ].map(({ val, label }) => (
                  <div key={label} className="px-4 py-3 text-center">
                    <p className="font-mono font-bold text-xl text-asphalt">{val}</p>
                    <p className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {result.preview?.length > 0 && (
              <div className="bg-card border border-concrete-dim">
                <div className="px-4 py-2 border-b border-concrete-dim">
                  <div className="section-label">Pirmās pozīcijas</div>
                </div>
                {result.preview.map((p, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2.5 border-b border-concrete-dim last:border-b-0">
                    <span className="text-sm text-asphalt">{p.nr} · {p.name}</span>
                    <span className="font-mono text-sm text-asphalt-soft">{p.quantity} {p.unit}</span>
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
