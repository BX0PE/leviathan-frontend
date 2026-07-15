// Login is a full-page redirect, not an XHR call — BIS needs to own
// the navigation to run its own login flow before bouncing back to us.
export function goToBisLogin() {
  const base = import.meta.env.VITE_API_URL || '/api'
  window.location.href = `${base}/auth/login`
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
