import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8000
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('leviathan_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// A request only counts as "offline" for our purposes if the browser
// itself is offline, or the request never got a response at all
// (DNS/timeout/connection refused). A 4xx/5xx with a response is a
// real backend error and should surface as one, not be queued.
export function isNetworkFailure(error) {
  return !navigator.onLine || (error.request && !error.response)
}
