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

export async function syncPositionsFromBis(caseId, positions, groups) {
  const { data } = await client.post(`/cases/${caseId}/sync-direct`, { positions, groups })
  return data
}

export async function importCasesFromBis(bisItems) {
  const { data } = await client.post('/cases/import-from-bis', { cases: bisItems })
  return data
}

export async function deleteCase(caseId) {
  const { data } = await client.delete(`/cases/${caseId}`)
  return data
}

// Returns { synced: true } on a normal success, or { synced: false } when
// the entry was saved locally because the device is offline right now.
export async function submitEntries({
  caseId, date, items,
  description = 'Būvdarbi',
  timeFrom = '08:00',
  timeTo = null,
  employees = 1,
  temperature = null,
  precipitation = false,
}) {
  const payload = {
    case_id: caseId,
    date,
    items,
    description,
    time_from: timeFrom,
    time_to: timeTo,
    employees,
    temperature,
    precipitation,
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
    return { synced: data.synced !== false, created: data.created, reason: data.reason }
  } catch (error) {
    if (isNetworkFailure(error)) {
      await queueEntry(payload)
      return { synced: false, created: items.length }
    }
    throw error
  }
}
