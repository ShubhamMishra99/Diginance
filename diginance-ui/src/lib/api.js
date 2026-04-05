const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:7002').replace(
  /\/$/,
  '',
)

const TOKEN_KEY = 'diginance_token'
const USER_KEY = 'diginance_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/** Build query string for transaction list / export filters */
export function buildTransactionQueryParams(filters = {}) {
  const params = new URLSearchParams()
  const map = {
    search: filters.search,
    type: filters.type,
    category: filters.category,
    startDate: filters.startDate,
    endDate: filters.endDate,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }
  Object.entries(map).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      params.set(k, String(v))
    }
  })
  return params
}

export async function api(path, options = {}) {
  const headers = { ...options.headers }
  const isForm = options.body instanceof FormData
  if (!isForm && options.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body:
      isForm || options.body === undefined || typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body),
  })

  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: text || res.statusText }
  }

  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : `Request failed (${res.status})`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

/**
 * Download CSV export with optional same filters as transaction list.
 */
export async function downloadTransactionsCsv(filters = {}) {
  const params = buildTransactionQueryParams(filters)
  params.set('format', 'csv')
  const token = getToken()
  const url = `${API_BASE}/api/reports/export?${params.toString()}`
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    const text = await res.text()
    let msg = `Export failed (${res.status})`
    try {
      const j = JSON.parse(text)
      if (j.message) msg = j.message
    } catch {
      if (text) msg = text
    }
    throw new Error(msg)
  }
  const blob = await res.blob()
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = 'diginance-transactions.csv'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}
