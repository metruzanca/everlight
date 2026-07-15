import pino from 'pino'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export interface Logger {
  debug(...args: unknown[]): void
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}

let serverPino: Logger | null = null

function initServerPino() {
  const level: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) ??
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

  serverPino = pino({ level }) as unknown as Logger
}

export function createLogger(name?: string): Logger {
  if (import.meta.env.SSR) {
    if (!serverPino) initServerPino()
    return serverPino!
  }

  const level: LogLevel = import.meta.env.DEV ? 'debug' : 'warn'
  const minLevel = LOG_LEVELS[level]
  const prefix = name ? `[${name}] ` : ''

  return {
    debug(...args: unknown[]) {
      if (minLevel <= 0) console.debug(prefix, ...args)
    },
    info(...args: unknown[]) {
      if (minLevel <= 1) console.info(prefix, ...args)
    },
    warn(...args: unknown[]) {
      if (minLevel <= 2) console.warn(prefix, ...args)
    },
    error(...args: unknown[]) {
      if (minLevel <= 3) console.error(prefix, ...args)
    },
  }
}
