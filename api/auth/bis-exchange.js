/**
 * Vercel Serverless Function: /api/auth/bis-exchange
 *
 * Proxies BIS token exchange + userinfo from the server side.
 * Needed because test.bis.gov.lv blocks CORS for browser→BIS fetches.
 * Vercel's IPs are not blocked, unlike Railway (162.220.232.72).
 */

const BIS_BASE = 'https://test.bis.gov.lv'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { code, code_verifier, client_id, redirect_uri } = req.body

  // ── 1. Exchange code → tokens ─────────────────────────────────────────────
  let tokens
  try {
    const tokenRes = await fetch(`${BIS_BASE}/bisp/api/auth/oauth2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri,
        client_id,
        code_verifier,
      }),
    })
    const text = await tokenRes.text()
    if (!tokenRes.ok) {
      res.status(tokenRes.status).json({
        error: `BIS token error ${tokenRes.status}: ${text.slice(0, 300)}`,
      })
      return
    }
    tokens = JSON.parse(text)
  } catch (e) {
    res.status(500).json({ error: `Token exchange failed: ${e.message}` })
    return
  }

  // ── 2. Fetch userinfo (best-effort) ──────────────────────────────────────
  let bis_sub = null, bis_email = null, bis_name = null
  try {
    const infoRes = await fetch(`${BIS_BASE}/services/auth/oauth2.0/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (infoRes.ok) {
      const info = await infoRes.json()
      bis_sub   = info.sub   || info.person_code || info.id   || null
      bis_email = info.email || null
      bis_name  = info.name  || info.given_name  || null
    }
  } catch {
    // userinfo unavailable — user will be created without sub
  }

  res.status(200).json({
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_in:    tokens.expires_in    ?? 7200,
    bis_sub,
    bis_email,
    bis_name,
  })
}
