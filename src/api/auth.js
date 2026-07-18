// ── BIS OAuth constants ───────────────────────────────────────────────────────
const BIS_BASE        = 'https://test.bis.gov.lv'
const BIS_CLIENT_ID   = import.meta.env.VITE_BIS_CLIENT_ID || ''
// redirect_uri должен совпадать с зарегистрированным в BIS
const BIS_REDIRECT_URI = import.meta.env.VITE_BIS_REDIRECT_URI
  || 'https://leviathan-app-one.vercel.app/auth/callback'
const BIS_SCOPES = 'logbooks:read logbooks:manage projects:read bis_case_documents:read'

// ── Old backend-redirect flow (для локальной разработки без IP block) ─────────
export function goToBisLogin() {
  const base = import.meta.env.VITE_API_URL || '/api'
  window.location.href = `${base}/auth/login`
}

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function _b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateVerifier() {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return _b64url(arr.buffer)
}

async function generateChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return _b64url(hash)
}

/**
 * PKCE login — браузер сам делает redirect на BIS.
 * Сохраняем code_verifier в sessionStorage, нужен в /auth/callback.
 * Используется в продакшне (Vercel) где VITE_BIS_CLIENT_ID задан.
 */
export async function goToBisLoginPkce() {
  const verifier   = generateVerifier()
  const challenge  = await generateChallenge(verifier)
  sessionStorage.setItem('pkce_verifier', verifier)

  const params = new URLSearchParams({
    response_type:         'code',
    client_id:             BIS_CLIENT_ID,
    redirect_uri:          BIS_REDIRECT_URI,
    scope:                 BIS_SCOPES,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
  })
  window.location.href = `${BIS_BASE}/services/auth/oauth2.0/authorize?${params}`
}

/**
 * Обменять authorization code на токены напрямую (браузер → BIS).
 * Вызывается в AuthCallback когда URL содержит ?code=...
 * Возвращает {access_token, refresh_token, expires_in, sub?, email?, name?}
 */
export async function exchangePkceCode(code) {
  const verifier = sessionStorage.getItem('pkce_verifier') || ''
  sessionStorage.removeItem('pkce_verifier')

  // 1. Обмен code → access_token (браузер → BIS напрямую, Railway не задействован)
  const tokenRes = await fetch(`${BIS_BASE}/bisp/api/auth/oauth2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  BIS_REDIRECT_URI,
      client_id:     BIS_CLIENT_ID,
      code_verifier: verifier,
    }),
  })
  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    throw new Error(`BIS token exchange failed ${tokenRes.status}: ${body.slice(0, 200)}`)
  }
  const tokens = await tokenRes.json()
  // tokens: {access_token, refresh_token, expires_in, ...}

  // 2. Получить профиль пользователя (браузер → BIS, тоже не заблокировано)
  //    Railway не может звонить в BIS (IP block), поэтому userinfo берём здесь.
  let sub = null, email = null, name = null
  try {
    const infoRes = await fetch(`${BIS_BASE}/services/auth/oauth2.0/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (infoRes.ok) {
      const info = await infoRes.json()
      sub   = info.sub   || info.person_code || info.id   || null
      email = info.email || null
      name  = info.name  || info.given_name  || null
    }
  } catch {
    // userinfo недоступен — создадим пользователя без sub (новый при каждом логине)
  }

  return { ...tokens, bis_sub: sub, bis_email: email, bis_name: name }
}

export function saveToken(token) {
  localStorage.setItem('leviathan_token', token)
}

export function getToken() {
  return localStorage.getItem('leviathan_token')
}

export function clearToken() {
  localStorage.removeItem('leviathan_token')
}

export function isLoggedIn() {
  return Boolean(getToken())
}

// ── Роль пользователя ────────────────────────────────────────────────────────
// 'foreman' | 'coordinator' | 'supervisor'

export function saveRole(role) {
  localStorage.setItem('leviathan_role', role)
}

export function getRole() {
  return localStorage.getItem('leviathan_role')
}

export function clearRole() {
  localStorage.removeItem('leviathan_role')
}

export function clearAll() {
  clearToken()
  clearRole()
}
