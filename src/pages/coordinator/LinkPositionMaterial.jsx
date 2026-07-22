/**
 * Привязка позиций сметы к карточкам материалов.
 *
 * Маршрут: /cases/:id/link-materials
 *
 * UX:
 * - Список всех позиций объекта, сгруппированный по разделам
 * - Привязанный материал → зелёный чип + кнопка × (отвязать)
 * - Не привязан → кнопка «+ Piesaistīt»
 * - Нажатие → inline поиск под строкой, live search 300ms
 * - Выбор материала → PATCH → чип обновляется мгновенно (оптимистично)
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import { fetchPositions } from '../../api/cases.js'
import {
  fetchMaterials,
  searchMaterials,
  linkPositionMaterial,
  unlinkPositionMaterial,
} from '../../api/materials.js'

// ── Маленький спиннер ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span className="inline-block w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
  )
}

// ── Inline search picker для одной позиции ───────────────────────────────────
function MaterialPicker({ caseId, position, allMaterials, onPick, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(allMaterials.slice(0, 20))
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!q.trim()) {
      setResults(allMaterials.slice(0, 20))
      return
    }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await searchMaterials(q.trim())
        setResults(res)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [q, allMaterials])

  return (
    <div className="border-t border-brand/30 bg-concrete-dim/40 px-4 py-3">
      {/* Search input */}
      <div className="relative mb-2">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Meklēt materiālu…"
          className="w-full bg-white border border-concrete-dim px-3 py-2 pr-8 font-mono text-sm text-asphalt focus:outline-none focus:border-brand"
        />
        <button
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-asphalt-soft hover:text-asphalt text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Results */}
      <div className="max-h-48 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 py-3 text-asphalt-soft font-mono text-xs">
            <Spinner /> Meklē…
          </div>
        )}
        {!loading && results.length === 0 && (
          <p className="py-3 font-mono text-xs text-asphalt-soft">Nav rezultātu</p>
        )}
        {!loading && results.map((m) => (
          <button
            key={m.id}
            onClick={() => onPick(position.id, m)}
            className="w-full text-left px-3 py-2.5 hover:bg-white active:bg-white/80 transition flex justify-between items-start gap-3 border-b border-concrete-dim/50 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-asphalt truncate">{m.name}</p>
              {m.manufacturer && (
                <p className="font-mono text-[10px] text-asphalt-soft tracking-wide mt-0.5 truncate">
                  {m.manufacturer}
                </p>
              )}
            </div>
            <span className="font-mono text-[10px] text-asphalt-soft tracking-wide whitespace-nowrap mt-0.5 shrink-0">
              {m.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Строка позиции ────────────────────────────────────────────────────────────
function PositionRow({ caseId, position, allMaterials, materialMap, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const linkedMat = position.material_id ? materialMap.get(position.material_id) : null

  async function handlePick(posId, material) {
    setSaving(true)
    setOpen(false)
    try {
      await linkPositionMaterial(caseId, posId, material.id)
      onUpdate(posId, material.id, material)
    } catch {
      // откат — ничего не делаем, состояние не изменилось
    } finally {
      setSaving(false)
    }
  }

  async function handleUnlink() {
    setSaving(true)
    try {
      await unlinkPositionMaterial(caseId, position.id)
      onUpdate(position.id, null, null)
    } catch {
      //
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-concrete-dim last:border-0">
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Position info */}
        <div className="flex-1 min-w-0">
          {position.position_nr && (
            <span className="font-mono text-[10px] text-asphalt-soft tracking-wide">
              {position.position_nr} ·{' '}
            </span>
          )}
          <span className="text-sm text-asphalt">{position.name}</span>
          {position.unit && (
            <span className="font-mono text-[10px] text-asphalt-soft ml-1">({position.unit})</span>
          )}
        </div>

        {/* Material status / action */}
        <div className="shrink-0 flex items-center gap-1.5 mt-0.5">
          {saving ? (
            <Spinner />
          ) : linkedMat ? (
            // Привязан — зелёный чип + отвязать
            <>
              <span
                className="font-mono text-[10px] px-2 py-1 bg-go/10 text-go border border-go/30 tracking-wide truncate max-w-[120px]"
                title={linkedMat.name}
              >
                ✓ {linkedMat.name.length > 14 ? linkedMat.name.slice(0, 14) + '…' : linkedMat.name}
              </span>
              <button
                onClick={handleUnlink}
                className="font-mono text-[11px] text-asphalt-soft hover:text-danger transition"
                title="Noņemt piesaisti"
              >
                ×
              </button>
            </>
          ) : (
            // Не привязан — кнопка
            <button
              onClick={() => setOpen((v) => !v)}
              className={`font-mono text-[11px] px-2.5 py-1 border tracking-wide transition ${
                open
                  ? 'border-brand text-brand bg-brand/5'
                  : 'border-concrete-dim text-asphalt-soft hover:border-brand hover:text-brand'
              }`}
            >
              {open ? '▲ Aizvērt' : '+ Piesaistīt'}
            </button>
          )}
        </div>
      </div>

      {/* Inline picker */}
      {open && (
        <MaterialPicker
          caseId={caseId}
          position={position}
          allMaterials={allMaterials}
          onPick={handlePick}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ── Главная страница ──────────────────────────────────────────────────────────
export default function LinkPositionMaterial() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [positions, setPositions] = useState([])
  const [allMaterials, setAllMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Карта id→material для быстрого lookup по linked material_id
  const materialMap = useMemo(() => {
    const m = new Map()
    for (const mat of allMaterials) m.set(mat.id, mat)
    return m
  }, [allMaterials])

  // Группировка позиций по разделам
  const groups = useMemo(() => {
    const map = new Map()
    for (const p of positions) {
      const key = p.group_name || 'Citi'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(p)
    }
    return Array.from(map.entries())
  }, [positions])

  // Статистика привязки
  const linkedCount = positions.filter((p) => p.material_id).length

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchPositions(id), fetchMaterials()])
      .then(([pos, mats]) => {
        if (cancelled) return
        setPositions(pos)
        setAllMaterials(mats)
        setLoading(false)
      })
      .catch((e) => {
        if (!cancelled) { setError(e.message); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [id])

  // Оптимистичное обновление позиции без перезагрузки
  function handleUpdate(posId, materialId, material) {
    setPositions((prev) =>
      prev.map((p) => p.id === posId ? { ...p, material_id: materialId } : p)
    )
    if (material && !materialMap.has(material.id)) {
      setAllMaterials((prev) => [...prev, material])
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-concrete">
      <Header title="Materiālu piesaiste" onBack />
      <div className="px-4 pt-5 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-card border border-concrete-dim px-4 py-3 flex justify-between gap-3 animate-pulse">
            <div className="flex-1">
              <div className="h-3 w-2/3 bg-concrete-dim/60 mb-1.5" />
              <div className="h-2.5 w-1/3 bg-concrete-dim/40" />
            </div>
            <div className="h-6 w-20 bg-concrete-dim/40 shrink-0" />
          </div>
        ))}
      </div>
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
      <Header title="Materiālu piesaiste" onBack />

      {/* Статус-бар */}
      <div className="bg-asphalt px-4 py-2 flex items-center gap-4">
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">Piesaistīts</span>
        <span className="font-mono text-[11px] text-brand font-semibold">
          {linkedCount} / {positions.length}
        </span>
        {linkedCount === positions.length && positions.length > 0 && (
          <span className="font-mono text-[11px] text-go tracking-wide">✓ Visi piesaistīti</span>
        )}
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {positions.length === 0 && (
          <div className="bg-card border border-concrete-dim px-4 py-8 text-center">
            <p className="font-mono text-sm text-asphalt-soft">Nav pozīciju · augšupielādē tāmi vispirms</p>
          </div>
        )}

        {groups.map(([groupName, items]) => (
          <div key={groupName} className="bg-card border border-concrete-dim">
            <div className="px-4 py-2 border-b border-concrete-dim bg-concrete flex justify-between items-center">
              <div className="section-label">{groupName}</div>
              <span className="font-mono text-[10px] text-asphalt-soft tracking-wide">
                {items.filter((p) => p.material_id).length}/{items.length}
              </span>
            </div>
            <div>
              {items.map((pos) => (
                <PositionRow
                  key={pos.id}
                  caseId={Number(id)}
                  position={pos}
                  allMaterials={allMaterials}
                  materialMap={materialMap}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
