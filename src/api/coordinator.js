import { client } from './client.js'

export async function fetchSummary(caseId) {
  const { data } = await client.get(`/cases/${caseId}/summary`)
  return data
}

export async function importEstimate(caseId, file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post(`/cases/${caseId}/import-estimate`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function importDocuments(caseId, files) {
  const form = new FormData()
  for (const f of files) form.append('files', f)
  const { data } = await client.post(`/cases/${caseId}/import-documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // PDF парсинг может занять время
  })
  return data
}

export async function fetchDocuments(caseId) {
  const { data } = await client.get(`/cases/${caseId}/documents`)
  return data
}

export async function linkDocument(docId, positionId) {
  const { data } = await client.patch(`/documents/${docId}/link`, null, {
    params: { position_id: positionId },
  })
  return data
}
