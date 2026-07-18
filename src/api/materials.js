import { client } from './client.js'

// ── Material Library ──────────────────────────────────────────────────────────

export async function fetchMaterials() {
  const { data } = await client.get('/materials')
  return data
}

export async function searchMaterials(q) {
  const { data } = await client.get('/materials/search', { params: { q } })
  return data
}

export async function fetchCategories() {
  const { data } = await client.get('/materials/categories')
  return data.categories
}

export async function fetchMaterial(id) {
  const { data } = await client.get(`/materials/${id}`)
  return data
}

export async function createMaterial(body) {
  const { data } = await client.post('/materials', body)
  return data
}

export async function updateMaterial(id, body) {
  const { data } = await client.patch(`/materials/${id}`, body)
  return data
}

// ── Declarations ──────────────────────────────────────────────────────────────

export async function uploadDeclaration(materialId, file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post(`/materials/${materialId}/declarations`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
  return data
}

export async function deleteDeclaration(declId) {
  await client.delete(`/declarations/${declId}`)
}

// ── Link position → material ──────────────────────────────────────────────────

export async function linkPositionMaterial(caseId, posId, materialId) {
  const { data } = await client.patch(
    `/cases/${caseId}/positions/${posId}/material`,
    null,
    { params: { material_id: materialId } }
  )
  return data
}
