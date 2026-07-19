import { createLogger } from './logger'

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
): Promise<Response> {
  const log = createLogger(name)
  const url = new URL(request.url)
  const method = request.method
  const path = url.pathname + url.search
  const start = Date.now()

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
