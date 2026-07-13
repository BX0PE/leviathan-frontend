import { client } from './client.js'

// Create a new invite token for the current company
export async function createInvite() {
  const { data } = await client.post('/invites')
  return data  // { token, expires_at }
}

// Fetch invite info (public — no auth needed)
export async function fetchInvite(token) {
  const { data } = await client.get(`/invites/${token}`)
  return data  // { company_name, invited_by, expires_at }
}

// Accept invite — called after OAuth, links user to company
export async function acceptInvite(token) {
  const { data } = await client.post(`/invites/${token}/accept`)
  return data
}
