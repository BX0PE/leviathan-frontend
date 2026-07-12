import { openDB } from 'idb'
import { client, isNetworkFailure } from '../api/client.js'

const DB_NAME = 'leviathan'
const DB_VERSION = 1

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('cases')) {
        db.createObjectStore('cases', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('positions')) {
        // keyed by case_id, value is the array of positions for that case
        db.createObjectStore('positions')
      }
      if (!db.objectStoreNames.contains('pending_entries')) {
        db.createObjectStore('pending_entries', { keyPath: 'local_id', autoIncrement: true })
      }
    }
  })
}

// ---- Cached reads: written whenever a live fetch succeeds, read back
// when the network is unavailable so the app keeps working offline. ----

export async function cacheCases(cases) {
  const db = await getDb()
  const tx = db.transaction('cases', 'readwrite')
  await Promise.all(cases.map((c) => tx.store.put(c)))
  await tx.done
}

export async function getCachedCases() {
  const db = await getDb()
  return db.getAll('cases')
}

export async function cachePositions(caseId, positions) {
  const db = await getDb()
  await db.put('positions', positions, caseId)
}

export async function getCachedPositions(caseId) {
  const db = await getDb()
  return (await db.get('positions', caseId)) || []
}

// ---- Pending entries queue: an entry lands here when POST /api/entries
// fails due to no connection. It is flushed automatically once the
// browser reports it's back online. ----

export async function queueEntry(entry) {
  const db = await getDb()
  const local_id = await db.add('pending_entries', { ...entry, status: 'pending', queued_at: new Date().toISOString() })
  return local_id
}

export async function getPendingEntries() {
  const db = await getDb()
  return db.getAll('pending_entries')
}

export async function removePendingEntry(localId) {
  const db = await getDb()
  await db.delete('pending_entries', localId)
}

export async function syncPendingEntries() {
  const pending = await getPendingEntries()
  for (const entry of pending) {
    try {
      const { local_id, status, queued_at, ...payload } = entry
      const res = await client.post('/entries', payload)
      if (res.data.synced !== false) {
        await removePendingEntry(local_id)
      }
    } catch (error) {
      if (isNetworkFailure(error)) {
        // still offline — stop, we'll try again on the next online event
        break
      }
      // A real backend error (e.g. validation) — drop it so it doesn't
      // block the queue forever, and surface it for later inspection.
      console.error('Failed to sync queued entry, dropping it:', entry, error)
      await removePendingEntry(entry.local_id)
    }
  }
}

// Сбрасывает записи что зависли на бэкенде (synced=False) — например
// если бэкенд сохранил запись но BIS был недоступен в момент отправки.
async function retryBackendQueue() {
  try {
    await client.post('/entries/retry-pending')
  } catch {
    // BIS всё ещё недоступен — ничего страшного, попробуем в следующий раз
  }
}

export function startSyncListener() {
  window.addEventListener('online', () => {
    syncPendingEntries()   // IndexedDB-очередь (записи сохранённые офлайн до бэкенда)
    retryBackendQueue()    // бэкенд-очередь (записи дошли до бэкенда, но не до BIS)
  })
  if (navigator.onLine) {
    syncPendingEntries()
    retryBackendQueue()
  }
}
