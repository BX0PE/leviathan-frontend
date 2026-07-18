import { client, isNetworkFailure } from './client.js'
import { mockCases } from '../mock/cases.js'
import { mockPositions } from '../mock/positions.js'
import { cacheCases, getCachedCases, cachePositions, getCachedPositions, queueEntry } from '../db/db.js'

const USE_MOCKS = false

export async function fetchCases() {
  if (USE_MOCKS) return mockCases
  try {
    const { data } = await client.get('/cases')
    await cacheCases(data)
    return data
  } catch (error) {
    if (isNetworkFailure(error)) return getCachedCases()
    throw error
  }
}

export async function fetchPositions(caseId) {
  if (USE_MOCKS) return mockPositions[caseId] || []
  try {
    const { data } = await client.get(`/cases/${caseId}/positions`)
    // Наш API возвращает group_name, фронт везде читает group — маппим здесь
    const normalized = data.map((p) => ({ ...p, group: p.group_name }))
    await cachePositions(caseId, normalized)
    return normalized
  } catch (error) {
    if (isNetworkFailure(error)) return getCachedPositions(caseId)
    throw error
  }
}

// Returns { synced: true } on a normal success, or { synced: false } when
// the entry was saved locally because the device is offline right now.
export async function submitEntries({ caseId, date, items, temperature = null, precipitation = false }) {
  const payload = {
    case_id: caseId,
    date,
    items,
    temperature,           // °C — обязательно по BIS регламенту
    precipitation,         // boolean — были ли осадки
  }
  if (USE_MOCKS) {
    if (!navigator.onLine) {
      await queueEntry(payload)
      return { synced: false, created: items.length }
    }
    return { synced: true, created: items.length }
  }
  try {
    const { data } = await client.post('/entries', payload)
    return { synced: data.synced !== false, created: data.created }
  } catch (error) {
    if (isNetworkFailure(error)) {
      await queueEntry(payload)
      return { synced: false, created: items.length }
    }
    throw error
  }
}
