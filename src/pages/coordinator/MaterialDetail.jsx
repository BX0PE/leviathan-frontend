import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import { fetchMaterial, uploadDeclaration, deleteDeclaration, updateMaterial, fetchCategories } from '../../api/materials.js'

const APPROVAL_METHODS = [
  { value: 'invoice', label: 'Piegādes pavadzīme' },
  { value: 'form',    label: 'Atsevišķa saskaņošanas forma' },
]

const APPROVAL_SIGS = [
  { value: 'paper',      label: 'Papīra paraksts' },
  { value: 'electronic', label: 'Elektroniskais paraksts' },
]

// ── Declaration row ───────────────────────────────────────────────────────────

function DeclRow({ d, onDelete }) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-concrete-dim last:border-0 bg-danger/5">
      <p className="text-sm text-danger font-medium">Dzēst "{d.file_name}"?</p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-xs font-mono bg-concrete border border-concrete-dim text-asphalt"
        >Nē</button>
        <button
          onClick={() => onDelete(d.id)}
          className="px-3 py-1.5 text-xs font-mono bg-danger text-white"
        >Dzēst</button>
      </div>
    </div>
  )

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-concrete-dim last:border-0">
      <span className="text-base mt-0.5 shrink-0">📄</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-asphalt truncate">{d.name || d.file_name}</p>
        <p className="font-mono text-[11px] text-asphalt-soft tracking-wide mt-0.5">
          {[d.manufacturer, d.standard, d.dop_number].filter(Boolean).join(' · ') || d.file_name}
        </p>
        {d.issued_at && (
          <p className="font-mono text-[10px] text-asphalt-soft mt-0.5">
            Izdots: {d.issued_at.slice(0, 10)}
          </p>
        )}
      </div>
      <button
        onClick={() => setConfirming(true)}
        className="shrink-0 text-asphalt-soft hover:text-danger text-lg leading-none mt-0.5"
        aria-label="Dzēst"
      >✕</button>
    </div>
  )
}

// ── Edit drawer ───────────────────────────────────────────────────────────────

function EditDrawer({ material, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:               material.name,
    category:           material.category || '',
    manufacturer:       material.manufacturer || '',
    standard:           material.standard || '',
    requires_approval:  material.requires_approval,
    approval_method:    material.approval_method || '',
    approval_signature: material.approval_signature || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    try {
      const saved = await updateMaterial(material.id, {
        name:               form.name.trim() || undefined,
        category:           form.category || null,
        manufacturer:       form.manufacturer.trim() || null,
        standard:           form.standard.trim() || null,
        requires_approval:  form.requires_approval,
        approval_method:    form.requires_approval ? (form.approval_method || null) : null,
        approval_signature: form.requires_approval ? (form.approval_signature || null) : null,
      })
      onSaved(saved)
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
          <span className="section-label">Rediģēt kartīti</span>
          <button onClick={onClose} className="text-asphalt-soft text-xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="px-4 py-4 flex flex-col gap-4">
          <div>
            <label className="section-label block mb-1.5">Nosaukums</label>
            <input
              className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm font-medium text-asphalt focus:outline-none focus:border-brand"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div>
            <label className="section-label block mb-1.5">Kategorija</label>
            <select
              className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm text-asphalt focus:outline-none focus:border-brand"
              value={form.category}
              onChange={e => set('category', e.target.value)}
            >
              <option value="">— Nav norādīts —</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1.5">Ražotājs</label>
              <input
                className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm text-asphalt focus:outline-none focus:border-brand"
                value={form.manufacturer}
                onChange={e => set('manufacturer', e.target.value)}
              />
            </div>
            <div>
              <label className="section-label block mb-1.5">Standarts</label>
              <input
                className="w-full bg-concrete border border-concrete-dim px-3 py-2.5 text-sm text-asphalt focus:outline-none focus:border-brand"
                value={form.standard}
                onChange={e => set('standard', e.target.value)}
              />
            </div>
          </div>

          <div className="border border-concrete-dim p-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand"
                checked={form.requires_approval}
                onChange={e => set('requires_approval', e.target.checked)}
              />
              <span className="text-sm font-medium text-asphalt">Nepieciešama saskaņošana</span>
            </label>
            {form.requires_approval && (
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <label className="section-label block mb-1.5">Saskaņošanas veids</label>
                  {APPROVAL_METHODS.map(m => (
                    <label key={m.value} className="flex items-center gap-2 cursor-pointer mb-1.5">
                      <input type="radio" name="am" value={m.value} checked={form.approval_method === m.value}
                        onChange={() => set('approval_method', m.value)} className="accent-brand" />
                      <span className="text-sm text-asphalt">{m.label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="section-label block mb-1.5">Paraksta veids</label>
                  {APPROVAL_SIGS.map(s => (
                    <label key={s.value} className="flex items-center gap-2 cursor-pointer mb-1.5">
                      <input type="radio" name="as" value={s.value} checked={form.approval_signature === s.value}
                        onChange={() => set('approval_signature', s.value)} className="accent-brand" />
                      <span className="text-sm text-asphalt">{s.label}</span>
                    </label>
                  ))}
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
            {saving ? 'Saglabā…' : 'Saglabāt'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [material, setMaterial] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [similarDecls, setSimilarDecls] = useState(null) // {newDecl, similar[]}
  const fileRef = useRef()

  useEffect(() => {
    Promise.all([fetchMaterial(id), fetchCategories()])
      .then(([m, cats]) => { setMaterial(m); setCategories(cats) })
      .catch(e => setError(e?.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadErr(null)
    try {
      const result = await uploadDeclaration(id, file)
      const similar = result.similar || []
      if (similar.length > 0) {
        // Показываем modal переиспользования — не добавляем сразу в список
        setSimilarDecls({ newDecl: result, similar })
      } else {
        // Нет похожих — сразу добавляем
        setMaterial(m => ({ ...m, declarations: [result, ...(m.declarations || [])] }))
      }
    } catch (e) {
      setUploadErr(e?.response?.data?.detail || e.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleKeepNew() {
    // Пользователь выбрал сохранить новую — добавляем в список
    setMaterial(m => ({ ...m, declarations: [similarDecls.newDecl, ...(m.declarations || [])] }))
    setSimilarDecls(null)
  }

  async function handleUseExisting(existingDecl) {
    // Удаляем только что загруженную, оставляем существующую
    try {
      await deleteDeclaration(similarDecls.newDecl.id)
    } catch { /* файл может не удалиться — не критично */ }
    setSimilarDecls(null)
    // Показываем инфо о существующей декларации вместо загрузки
    setMaterial(m => ({
      ...m,
      declarations: [existingDecl, ...(m.declarations || []).filter(d => d.id !== existingDecl.id)],
    }))
  }

  async function handleDeleteDecl(declId) {
    try {
      await deleteDeclaration(declId)
      setMaterial(m => ({ ...m, declarations: m.declarations.filter(d => d.id !== declId) }))
    } catch (e) {
      alert(e?.response?.data?.detail || e.message)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-concrete">
      <Header title="…" onBack />
      <p className="px-4 pt-6 font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Kļūda" onBack />
      <p className="px-4 pt-6 text-danger font-mono text-sm">{error}</p>
    </div>
  )

  const m = material

  return (
    <div className="min-h-screen bg-concrete pb-10">
      <Header
        title={m.name}
        onBack
        right={
          <button
            onClick={() => setShowEdit(true)}
            className="text-brand font-semibold text-sm min-h-tap px-2 flex items-center"
          >Rediģēt</button>
        }
      />

      <div className="px-4 pt-5 flex flex-col gap-4">

        {/* ── Pamata info ── */}
        <div className="bg-card border border-concrete-dim">
          <div className="px-4 py-3 border-b border-concrete-dim flex justify-between items-center">
            <span className="section-label">Informācija</span>
            {m.requires_approval && (
              <span className="font-mono text-[10px] text-caution tracking-widest uppercase bg-caution/10 px-2 py-1">
                ⚠ Jāsaskaņo
              </span>
            )}
          </div>
          <div className="divide-y divide-concrete-dim">
            {[
              ['Kategorija', m.category],
              ['Ražotājs', m.manufacturer],
              ['Standarts', m.standard],
              ['Saskaņošana', m.requires_approval
                ? [
                    APPROVAL_METHODS.find(x => x.value === m.approval_method)?.label,
                    APPROVAL_SIGS.find(x => x.value === m.approval_signature)?.label,
                  ].filter(Boolean).join(', ') || 'Jā'
                : null
              ],
              ['Izmantots pozīcijās', m.used_in_positions != null ? `${m.used_in_positions} poz.` : null],
            ].map(([label, val]) => val != null ? (
              <div key={label} className="flex justify-between items-baseline px-4 py-2.5">
                <span className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase">{label}</span>
                <span className="text-sm font-medium text-asphalt text-right max-w-[60%]">{val}</span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* ── Deklarāciju arhīvs ── */}
        <div className="bg-card border border-concrete-dim">
          <div className="px-4 py-3 border-b border-concrete-dim flex justify-between items-center">
            <span className="section-label">DoP deklarācijas ({m.declarations?.length || 0})</span>
          </div>

          {m.declarations?.length > 0 ? (
            <div>
              {m.declarations.map(d => (
                <DeclRow key={d.id} d={d} onDelete={handleDeleteDecl} />
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="font-mono text-[11px] text-asphalt-soft tracking-wide">Nav pievienotu deklarāciju</p>
            </div>
          )}

          {/* Upload button */}
          <div className="px-4 py-3 border-t border-concrete-dim">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center gap-3 py-3 px-4 border border-dashed border-brand/40 text-brand hover:bg-brand/5 active:bg-brand/10 transition disabled:opacity-50"
            >
              <span className="text-lg">📤</span>
              <div className="text-left">
                <p className="text-sm font-semibold">
                  {uploading ? 'Augšupielādē…' : 'Pievienot DoP deklarāciju'}
                </p>
                <p className="font-mono text-[11px] opacity-60 tracking-wide mt-0.5">
                  PDF fails · automātisks parsēšana
                </p>
              </div>
            </button>
            {uploadErr && <p className="text-danger font-mono text-xs mt-2">{uploadErr}</p>}
          </div>
        </div>

        {/* ── Skatīt objektus ── */}
        {m.used_in_positions > 0 && (
          <div className="bg-card border border-concrete-dim px-4 py-3">
            <p className="font-mono text-[11px] text-asphalt-soft tracking-widest uppercase">
              Šis materiāls izmantots <b className="text-asphalt">{m.used_in_positions}</b> sāmes pozīcijās
            </p>
          </div>
        )}

      </div>

      {showEdit && (
        <EditDrawer
          material={m}
          categories={categories}
          onClose={() => setShowEdit(false)}
          onSaved={(saved) => { setMaterial(m => ({ ...m, ...saved })); setShowEdit(false) }}
        />
      )}

      {/* ── Похожие декларации — modal переиспользования ── */}
      {similarDecls && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-card w-full max-w-lg">
            <div className="px-4 py-4 border-b border-concrete-dim">
              <p className="section-label">Atrasta līdzīga deklarācija</p>
              <p className="font-mono text-[11px] text-asphalt-soft mt-1">
                Bibliotēkā jau pastāv {similarDecls.similar.length === 1 ? 'šāda' : `${similarDecls.similar.length} šādas`} deklarācija.
                Vai izmantot esošo?
              </p>
            </div>

            <div className="divide-y divide-concrete-dim max-h-52 overflow-y-auto">
              {similarDecls.similar.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleUseExisting(d)}
                  className="w-full text-left px-4 py-3 hover:bg-concrete transition flex items-start gap-3"
                >
                  <span className="text-base shrink-0 mt-0.5">📄</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-asphalt truncate">{d.name || d.file_name}</p>
                    <p className="font-mono text-[11px] text-asphalt-soft mt-0.5">
                      {[d.manufacturer, d.standard, d.dop_number].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-brand tracking-wide mt-1">
                    Izmantot →
                  </span>
                </button>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-concrete-dim flex gap-2">
              <button
                onClick={handleKeepNew}
                className="flex-1 border border-concrete-dim font-mono text-[11px] text-asphalt-soft tracking-widest uppercase py-2.5 hover:bg-concrete transition"
              >
                Saglabāt jauno
              </button>
              <button
                onClick={() => setSimilarDecls(null)}
                className="font-mono text-[11px] text-asphalt-soft/50 tracking-widest uppercase py-2.5 px-3 hover:text-asphalt-soft transition"
              >
                Atcelt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
