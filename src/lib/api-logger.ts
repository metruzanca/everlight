import { createLogger } from './logger'
import { checkRateLimit } from './rate-limiter'

function isProduction(): boolean {
  try {
    return import.meta.env.PROD
  } catch {
    return false
  }
}

export async function apiHandler(
  request: Request,
  handler: () => Promise<Response>,
  name: string,
  rateLimit?: { max: number; windowMs: number },
): Promise<Response> {
  const log = createLogger(name)
  const url = new URL(request.url)
  const method = request.method
  const path = url.pathname + url.search
  const start = Date.now()

  if (rateLimit) {
    const blocked = checkRateLimit(name, request, rateLimit.max, rateLimit.windowMs)
    if (blocked) return blocked
  }

  log.info({ method, path }, 'request')

  try {
    const response = await handler()
    const duration = Date.now() - start
    const level = response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info'
    log[level]({ method, path, status: response.status, durationMs: duration }, 'response')
    return response
  } catch (err) {
    const duration = Date.now() - start
    log.error({ method, path, durationMs: duration, err }, 'unhandled error')
    const message = isProduction() ? 'Internal server error' : (err instanceof Error ? err.message : 'Internal server error')
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

export function apiRespond(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function apiError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
