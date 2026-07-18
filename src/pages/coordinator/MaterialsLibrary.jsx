import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import { fetchMaterials, searchMaterials, fetchCategories, createMaterial } from '../../api/materials.js'

// ── helpers ───────────────────────────────────────────────────────────────────

function debounce(fn, ms) {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

const APPROVAL_METHODS = [
  { value: 'invoice', label: 'Piegādes pavadzīme' },
  { value: 'form',    label: 'Atsevišķa saskaņošanas forma' },
]

const APPROVAL_SIGS = [
  { value: 'paper',      label: 'Papīra paraksts' },
  { value: 'electronic', label: 'Elektroniskais paraksts' },
]

// ── subcomponents ─────────────────────────────────────────────────────────────

function MaterialCard({ m, onClick }) {
  const hasDecl = m.declarations_count > 0
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-concrete-dim px-4 py-3 text-left flex items-start gap-3 hover:bg-concrete active:bg-concrete-dim transition"
    >
      <div className="mt-0.5 text-lg shrink-0">🧱</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-asphalt truncate">{m.name}</p>
        <p className="font-mono text-[11px] text-asphalt-soft tracking-wide mt-0.5 truncate">
          {[m.manufacturer, m.standard].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {m.requires_approval && (
          <span className="block font-mono text-[10px] text-caution tracking-widest uppercase mb-1">Saskaņot</span>
        )}
        <span className={`font-mono text-[11px] ${hasDecl ? 'text-go' : 'text-asphalt-soft'}`}>
          {hasDecl ? `✓ ${m.declarations_count} DoP` : 'Nav DoP'}
        </span>
      </div>
    </button>
  )
}

function CreateModal({ categories, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    manufacturer: '',
    standard: '',
    requires_approval: false,
    approval_method: '',
    approval_signature: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setErr('Nosaukums ir obligāts'); return }
    setSaving(true)
    setErr(null)
    try {
      const body = {
        name: form.name.trim(),
        category: form.category || null,
        manufacturer: form.manufacturer.trim() || null,
        standard: form.standard.trim() || null,
        requires_approval: form.requires_approval,
        approval_method: form.requires_approval ? (form.approval_method || null) : null,
        approval_signature: form.requires_approval ? (form.approval_signature || null) : null,
      }
      const created = await createMaterial(body)
      onCreate(created)
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-4 border-b border-concrete-dim flex justify-between items-center">
          <span className="section-label">Jauna materiāla kartīte</span>
          <button onClick={onClose} className="text-asphalt-soft text-xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="px-4 py-4 flex flex-col gap-4">

          {/* Nosaukums */}
          <div>
            <label className="section-label block mb-1.5">Nosaukums *</label>
            <input
              className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm font-medium text-asphalt placeholder:text-asphalt-soft focus:outline-none focus:border-brand"
              placeholder="Piem. Kabeļu trase 100×60mm"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>

          {/* Kategorija */}
          <div>
            <label className="section-label block mb-1.5">Kategorija</label>
            <select
              className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm text-asphalt focus:outline-none focus:border-brand"
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              <option value="">— Nav norādīts —</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Ražotājs + Standarts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1.5">Ražotājs</label>
              <input
                className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm text-asphalt placeholder:text-asphalt-soft focus:outline-none focus:border-brand"
                placeholder="Piem. ABB"
                value={form.manufacturer}
                onChange={e => set('manufacturer', e.target.value)}
              />
            </div>
            <div>
              <label className="section-label block mb-1.5">Standarts</label>
              <input
                className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm text-asphalt placeholder:text-asphalt-soft focus:outline-none focus:border-brand"
                placeholder="LVS EN 61386"
                value={form.standard}
                onChange={e => set('standard', e.target.value)}
              />
            </div>
          </div>

          {/* Saskaņošana */}
          <div className="border border-concrete-dim p-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand"
                checked={form.requires_approval}
                onChange={e => set('requires_approval', e.target.checked)}
              />
              <span className="text-sm font-medium text-asphalt">Nepieciešama būvniecības ierosinātāja saskaņošana</span>
            </label>

            {form.requires_approval && (
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <label className="section-label block mb-1.5">Saskaņošanas veids</label>
                  <div className="flex flex-col gap-1.5">
                    {APPROVAL_METHODS.map(m => (
                      <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="approval_method"
                          value={m.value}
                          checked={form.approval_method === m.value}
                          onChange={() => set('approval_method', m.value)}
                          className="accent-brand"
                        />
                        <span className="text-sm text-asphalt">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="section-label block mb-1.5">Paraksta veids</label>
                  <div className="flex flex-col gap-1.5">
                    {APPROVAL_SIGS.map(s => (
                      <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="approval_signature"
                          value={s.value}
                          checked={form.approval_signature === s.value}
                          onChange={() => set('approval_signature', s.value)}
                          className="accent-brand"
                        />
                        <span className="text-sm text-asphalt">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {err && <p className="text-danger text-sm font-mono">{err}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-brand text-white py-3 font-semibold text-sm tracking-wide disabled:opacity-50"
          >
            {saving ? 'Saglabā…' : 'Izveidot kartīti'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function MaterialsLibrary() {
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    Promise.all([fetchMaterials(), fetchCategories()])
      .then(([mats, cats]) => {
        setMaterials(mats)
        setCategories(cats)
      })
      .catch(e => setError(e?.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }, [])

  // Debounced search
  const doSearch = useCallback(debounce(async (q) => {
    if (!q.trim()) {
      const mats = await fetchMaterials()
      setMaterials(mats)
      setSearching(false)
      return
    }
    try {
      const results = await searchMaterials(q)
      setMaterials(results)
    } catch {}
    setSearching(false)
  }, 350), [])

  function handleSearch(e) {
    const q = e.target.value
    setQuery(q)
    setSearching(true)
    doSearch(q)
  }

  function handleCreated(m) {
    setShowCreate(false)
    setMaterials(prev => [m, ...prev])
    navigate(`/materials/${m.id}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Materiālu bibliotēka" onBack />
      <p className="px-4 pt-6 font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Kļūda" onBack />
      <p className="px-4 pt-6 text-danger font-mono text-sm">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header title="Materiālu bibliotēka" onBack />

      <div className="px-4 pt-5 flex flex-col gap-4">

        {/* Search bar */}
        <div className="relative">
          <input
            className="w-full bg-card border border-concrete-dim px-4 py-3 pr-10 text-sm text-asphalt placeholder:text-asphalt-soft focus:outline-none focus:border-brand font-medium"
            placeholder="Meklēt pēc nosaukuma vai ražotāja…"
            value={query}
            onChange={handleSearch}
          />
          {searching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-asphalt-soft font-mono text-xs">…</span>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase">
            {materials.length} materiāl{materials.length === 1 ? 's' : 'i'}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand text-white px-4 py-2 text-xs font-semibold tracking-wide"
          >
            + Jauna kartīte
          </button>
        </div>

        {/* List */}
        {materials.length === 0 ? (
          <div className="bg-card border border-concrete-dim px-4 py-8 text-center">
            <p className="text-2xl mb-2">📦</p>
            <p className="text-sm font-medium text-asphalt mb-1">
              {query ? 'Nav atrasts' : 'Bibliotēka ir tukša'}
            </p>
            <p className="font-mono text-[11px] text-asphalt-soft tracking-wide">
              {query ? 'Mēģini citu meklēšanas vārdu' : 'Pievieno pirmo materiālu'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {materials.map(m => (
              <MaterialCard
                key={m.id}
                m={m}
                onClick={() => navigate(`/materials/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          categories={categories}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreated}
        />
      )}
    </div>
  )
}
