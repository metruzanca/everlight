import { apiError } from './api-logger'

type Entry = {
  count: number
  resetAt: number
}

const stores = new Map<string, Map<string, Entry>>()
const MAX_ENTRIES = 10000

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
}

export function checkRateLimit(route: string, request: Request, max: number, windowMs: number): Response | null {
  let store = stores.get(route)
  if (!store) {
    store = new Map()
    stores.set(route, store)
  }

  if (store.size > MAX_ENTRIES) {
    const now = Date.now()
    for (const [k, v] of store) {
      if (now >= v.resetAt) store.delete(k)
    }
  }

  const key = getClientIp(request)
  const now = Date.now()

  const entry = store.get(key)
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  entry.count++
  if (entry.count > max) {
    return apiError('Too many requests', 429)
  }

  return null
}
