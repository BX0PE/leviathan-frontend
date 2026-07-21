import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import PositionRow from '../components/PositionRow.jsx'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { fetchCases, fetchPositions, syncPositionsFromBis } from '../api/cases.js'
import { client } from '../api/client.js'
import { fetchBisPositionsDirect, fetchBisGroupsDirect } from '../api/auth.js'

function today() {
  return new Date().toLocaleDateString('lv-LV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseName, setCaseName] = useState('')
  const [positions, setPositions] = useState([])
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const [bisCaseId, setBisCaseId] = useState(null)

  // Darbu apraksts — описание работ (обязательное в BIS)
  const [description, setDescription] = useState('')
  const [descriptionPrefilled, setDescriptionPrefilled] = useState(false)

  // Laiks — время работ
  const [timeFrom, setTimeFrom] = useState(nowTime())
  const [timeTo, setTimeTo]     = useState('')

  // Strādājošo skaits — кол-во рабочих (обязательное в BIS)
  const [employees, setEmployees] = useState('1')

  // Погода — необязательная
  const [temperature, setTemperature] = useState('')
  const [precipitation, setPrecipitation] = useState(false)

  // Поиск позиций
  const [search, setSearch] = useState('')

  async function doSyncFromBis(bisCid, cancelled = false) {
    setSyncing(true)
    setSyncError(null)
    try {
      const token = sessionStorage.getItem('bis_access_token')
      console.log('[sync] BIS token:', token ? token.slice(0, 20) + '…' : 'NULL')
      console.log('[sync] bis_case_id:', bisCid)

      const [bisPos, bisGroups] = await Promise.all([
        fetchBisPositionsDirect(bisCid),
        fetchBisGroupsDirect(bisCid),
      ])
      console.log('[sync] positions from BIS:', bisPos?.length, bisPos)
      console.log('[sync] groups from BIS:', bisGroups?.length)

      if (!bisPos || bisPos.length === 0) {
        if (!cancelled) setSyncError('BIS neatgrieza pozīcijas. Pārbaudi vai lieta ir "Būvdarbi" stadijā un vai BIS tokens ir aktīvs.')
        if (!cancelled) setSyncing(false)
        return
      }
      if (!cancelled) {
        await syncPositionsFromBis(id, bisPos, bisGroups || [])
        const refreshed = await fetchPositions(id)
        if (!cancelled) { setPositions(refreshed); setSyncing(false) }
      }
    } catch (e) {
      console.error('[sync] error:', e)
      if (!cancelled) { setSyncError(e.message || 'Sinhronizācijas kļūda'); setSyncing(false) }
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [cases, pos, entries] = await Promise.all([
        fetchCases(),
        fetchPositions(id),
        client.get(`/cases/${id}/entries`).then((r) => r.data).catch(() => []),
      ])
      if (cancelled) return

      const c = cases.find((x) => String(x.id) === String(id))
      setCaseName(c ? c.name : 'Objekts')
      if (c?.bis_case_id) setBisCaseId(c.bis_case_id)

      // Позиций нет — пробуем синхронизировать из BIS через браузер
      if (pos.length === 0 && c?.bis_case_id) {
        await doSyncFromBis(c.bis_case_id, cancelled)
      } else {
        setPositions(pos)
      }

      if (!cancelled) {
        setLoading(false)
        // Предзаполняем описание последним использованным
        if (entries.length > 0) {
          const last = entries[0]
          if (last.description && last.description !== 'Būvdarbi') {
            setDescription(last.description)
            setDescriptionPrefilled(true)
          }
          if (last.employees) {
            setEmployees(String(last.employees))
          }
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? positions.filter((p) => p.name.toLowerCase().includes(q))
      : positions
    const map = new Map()
    for (const p of filtered) {
      if (!map.has(p.group)) map.set(p.group, [])
      map.get(p.group).push(p)
    }
    return Array.from(map.entries())
  }, [positions, search])

  function setValue(positionId, raw) {
    setValues((prev) => ({ ...prev, [positionId]: raw }))
  }

  const filledCount = Object.values(values).filter((v) => v !== '' && v !== undefined).length
  const tempNum = temperature !== '' ? parseFloat(temperature) : null
  const empNum  = parseInt(employees) || 1
  const canSubmit = filledCount > 0 && description.trim().length > 0 && empNum > 0

  function handleSubmit() {
    const items = positions
      .filter((p) => values[p.id] !== undefined && values[p.id] !== '')
      .map((p) => ({ position_id: p.id, quantity: Number(values[p.id]), name: p.name, unit: p.unit }))
    navigate(`/cases/${id}/confirm`, {
      state: {
        caseId: Number(id),
        caseName,
        items,
        description: description.trim(),
        timeFrom,
        timeTo: timeTo || null,
        employees: empNum,
        temperature: tempNum,
        precipitation,
      },
    })
  }

  return (
    <div className="min-h-screen bg-concrete pb-28">
      <Header title={caseName || '…'} onBack={true} />

      {/* Date bar */}
      <div className="bg-asphalt px-4 py-2 flex items-center gap-3">
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">Šodien</span>
        <span className="font-mono text-[11px] text-white/70 tracking-wide">{today()}</span>
        {filledCount > 0 && (
          <span className="font-mono text-[11px] text-brand tracking-wide">
            {filledCount} poz. aizpildītas
          </span>
        )}
        <button
          onClick={() => navigate(`/cases/${id}/history`)}
          className="ml-auto font-mono text-[10px] text-white/30 tracking-widests uppercase hover:text-white/60 transition"
        >
          Vēsture ›
        </button>
      </div>

      <div className="px-4 pt-4">

        {/* ── Darbu apraksts (обязательный в BIS) ── */}
        <div className="bg-card border border-concrete-dim mb-3">
          <div className="px-4 py-2 border-b border-concrete-dim bg-concrete flex items-center gap-2">
            <div className="section-label">Darbu apraksts</div>
            {descriptionPrefilled && (
              <span className="font-mono text-[9px] text-asphalt-soft/60 tracking-widest uppercase border border-concrete-dim px-1.5 py-0.5">
                iepriekšējā
              </span>
            )}
            <span className="font-mono text-[10px] text-danger tracking-widest ml-auto">*</span>
          </div>
          <div className="px-4 py-3">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ko šodien darīja? Piem.: Ūdensvada izbūve tranšejā, De63x3.8 PE100-RC caurule, 45m…"
              className="w-full bg-concrete border border-concrete-dim px-3 py-2 font-mono text-sm text-asphalt resize-none focus:outline-none focus:border-brand placeholder:text-asphalt-soft/50"
            />
          </div>
        </div>

        {/* ── Laiks + Strādājošie (одна строка) ── */}
        <div className="bg-card border border-concrete-dim mb-3">
          <div className="px-4 py-2 border-b border-concrete-dim bg-concrete">
            <div className="section-label">Laiks un darbinieki</div>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Laiks no */}
            <div className="flex items-center gap-1.5">
              <label className="font-mono text-[10px] text-asphalt-soft tracking-widest uppercase whitespace-nowrap">No</label>
              <input
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className="bg-concrete border border-concrete-dim px-2 py-1.5 font-mono text-sm text-asphalt focus:outline-none focus:border-brand w-[90px]"
              />
            </div>
            {/* Laiks līdz */}
            <div className="flex items-center gap-1.5">
              <label className="font-mono text-[10px] text-asphalt-soft tracking-widest uppercase whitespace-nowrap">Līdz</label>
              <input
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className="bg-concrete border border-concrete-dim px-2 py-1.5 font-mono text-sm text-asphalt focus:outline-none focus:border-brand w-[90px]"
              />
            </div>
            {/* Divider */}
            <div className="w-px h-8 bg-concrete-dim mx-1" />
            {/* Strādājošie */}
            <div className="flex items-center gap-1.5">
              <span className="text-base">👷</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="999"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className="bg-concrete border border-concrete-dim px-2 py-1.5 font-mono text-sm text-asphalt text-center focus:outline-none focus:border-brand w-[52px]"
              />
              <label className="font-mono text-[10px] text-asphalt-soft tracking-widests uppercase">cilv.</label>
            </div>
          </div>
        </div>

        {/* ── Laika apstākļi (необязательные) ── */}
        <div className="bg-card border border-concrete-dim mb-4">
          <div className="px-4 py-2 border-b border-concrete-dim bg-concrete flex items-center gap-2">
            <div className="section-label">Laika apstākļi</div>
            <span className="font-mono text-[10px] text-asphalt-soft tracking-widest uppercase ml-auto">ieteicams</span>
          </div>
          <div className="px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <label className="font-mono text-[11px] text-asphalt-soft tracking-widests uppercase whitespace-nowrap">Temp.</label>
              <div className="relative flex-1 max-w-[100px]">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="—"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full bg-concrete border border-concrete-dim px-3 py-2 font-mono text-sm text-asphalt text-right pr-8 focus:outline-none focus:border-brand"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[11px] text-asphalt-soft">°C</span>
              </div>
            </div>
            <div className="w-px h-8 bg-concrete-dim" />
            <div className="flex items-center gap-2">
              <label className="font-mono text-[11px] text-asphalt-soft tracking-widests uppercase">Nokrišņi</label>
              <button
                type="button"
                onClick={() => setPrecipitation((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold tracking-wide transition border ${
                  precipitation
                    ? 'bg-brand/10 border-brand text-brand'
                    : 'bg-concrete border-concrete-dim text-asphalt-soft'
                }`}
              >
                {precipitation ? '🌧 Jā' : '☀ Nē'}
              </button>
            </div>
          </div>
          {!tempNum && filledCount > 0 && (
            <p className="px-4 pb-3 font-mono text-[11px] text-asphalt-soft tracking-wide">
              Ja šodien bija laika atkarīgi darbi — ievadi temperatūru
            </p>
          )}
        </div>

        {/* ── Pozīciju meklēšana ── */}
        {!loading && positions.length > 5 && (
          <div className="relative mb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Meklēt pozīciju…"
              className="w-full bg-card border border-concrete-dim px-4 py-2.5 font-mono text-sm text-asphalt placeholder:text-asphalt-soft/40 focus:outline-none focus:border-brand"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-asphalt-soft hover:text-asphalt"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {loading && !syncing && (
          <p className="font-mono text-sm text-asphalt-soft tracking-wide">Ielādējam pozīcijas…</p>
        )}

        {syncing && (
          <p className="font-mono text-sm text-brand tracking-wide">↻ Sinhronizācija ar BIS…</p>
        )}

        {syncError && (
          <div className="bg-card border border-danger/30 px-4 py-3 mb-3">
            <p className="font-mono text-[11px] text-danger tracking-wide mb-2">⚠ {syncError}</p>
            {bisCaseId && (
              <button
                onClick={() => doSyncFromBis(bisCaseId)}
                className="font-mono text-[10px] text-brand tracking-widest uppercase hover:text-brand-dark transition"
              >
                Mēģināt vēlreiz ↻
              </button>
            )}
          </div>
        )}

        {!loading && !syncing && positions.length === 0 && !syncError && (
          <div className="bg-card border border-concrete-dim">
            <EmptyState
              icon="📋"
              title="Nav pozīciju"
              description="Koordinatoram jāaugšupielādē tāme, lai šeit parādītos darbu saraksts"
            />
            {bisCaseId && (
              <div className="px-4 pb-4 text-center">
                <button
                  onClick={() => doSyncFromBis(bisCaseId)}
                  className="font-mono text-[11px] text-brand tracking-widest uppercase hover:text-brand-dark transition"
                >
                  ↻ Sinhronizēt no BIS
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && positions.length > 0 && groups.length === 0 && search && (
          <div className="bg-card border border-concrete-dim">
            <EmptyState
              icon="🔍"
              title="Nav rezultātu"
              description={`Pozīcija "${search}" netika atrasta`}
            />
          </div>
        )}

        {groups.map(([groupName, items]) => (
          <div key={groupName} className="bg-card border border-concrete-dim mb-3">
            <div className="px-4 py-2 border-b border-concrete-dim bg-concrete">
              <div className="section-label">{groupName}</div>
            </div>
            <div className="px-4">
              {items.map((p) => (
                <PositionRow
                  key={p.id}
                  position={p}
                  value={values[p.id]}
                  onChange={(v) => setValue(p.id, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t-2 border-concrete-dim px-4 py-3">
        {!canSubmit && filledCount > 0 && !description.trim() && (
          <p className="font-mono text-[10px] text-caution tracking-wide text-center mb-2">
            ⚠ Aizpildi darbu aprakstu
          </p>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Nosūtīt uz BIS
        </Button>
      </div>
    </div>
  )
}
