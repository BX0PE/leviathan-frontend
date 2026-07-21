/**
 * Vercel Serverless Function: /api/auth/bis-exchange
 *
 * Proxies BIS token exchange + userinfo.
 * Uses native https module (not fetch) + rejectUnauthorized:false for test env.
 * Deployed from Frankfurt (fra1) — EU region, not blocked by test.bis.gov.lv.
 */

import https from 'https'

const BIS_HOST = 'test.bis.gov.lv'

function httpsPost(path, body, headers) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body)
    const options = {
      hostname: BIS_HOST,
      port: 443,
      path,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': bodyBuf.length,
        'User-Agent': 'LEVIATHAN/1.0 (BIS OAuth proxy)',
      },
      rejectUnauthorized: false, // test.bis.gov.lv may use non-standard CA
    }
    const req = https.request(options, (resp) => {
      const chunks = []
      resp.on('data', (c) => chunks.push(c))
      resp.on('end', () => resolve({ status: resp.statusCode, body: Buffer.concat(chunks).toString() }))
    })
    req.on('error', reject)
    req.write(bodyBuf)
    req.end()
  })
}

function httpsGet(path, headers) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BIS_HOST,
      port: 443,
      path,
      method: 'GET',
      headers: { ...headers, 'User-Agent': 'LEVIATHAN/1.0 (BIS OAuth proxy)' },
      rejectUnauthorized: false,
    }
    const req = https.request(options, (resp) => {
      const chunks = []
      resp.on('data', (c) => chunks.push(c))
      resp.on('end', () => resolve({ status: resp.statusCode, body: Buffer.concat(chunks).toString() }))
    })
    req.on('error', reject)
    req.end()
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { code, code_verifier, client_id, redirect_uri } = req.body

  // ── 1. Exchange code → tokens ─────────────────────────────────────────────
  let tokens
  try {
    const params = new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri,
      client_id,
      code_verifier,
    }).toString()

    const { status, body } = await httpsPost(
      '/bisp/api/auth/oauth2.0/token',
      params,
      { 'Content-Type': 'application/x-www-form-urlencoded' },
    )

    if (status !== 200) {
      res.status(status).json({ error: `BIS token error ${status}: ${body.slice(0, 300)}` })
      return
    }
    tokens = JSON.parse(body)
  } catch (e) {
    res.status(500).json({ error: `Token exchange failed: ${e.message}` })
    return
  }

  // ── 2. Userinfo (best-effort) ─────────────────────────────────────────────
  let bis_sub = null, bis_email = null, bis_name = null
  try {
    const { status, body } = await httpsGet(
      '/services/auth/oauth2.0/userinfo',
      { Authorization: `Bearer ${tokens.access_token}` },
    )
    if (status === 200) {
      const info = JSON.parse(body)
      bis_sub   = info.sub   || info.person_code || info.id   || null
      bis_email = info.email || null
      bis_name  = info.name  || info.given_name  || null
    }
  } catch {}

  res.status(200).json({
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_in:    tokens.expires_in    ?? 7200,
    bis_sub,
    bis_email,
    bis_name,
  })
}
