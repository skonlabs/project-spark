/**
 * Structured logger — writes to console AND the system_logs DB table.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   const log = logger('analysis')
 *   log.info('Analysis started', { projectId, reportId })
 *   log.error('Analysis failed', { projectId, error: err.message })
 */

import { prisma } from './prisma'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogMeta {
  userId?: string
  projectId?: string
  traceId?: string
  [key: string]: unknown
}

async function writeLog(
  level: LogLevel,
  service: string,
  message: string,
  meta: LogMeta = {}
): Promise<void> {
  const { userId, projectId, traceId, ...rest } = meta

  // Always print to console for local dev / container stdout
  const consoleMsg = `[${level.toUpperCase()}] [${service}] ${message}`
  const metaStr = Object.keys(rest).length ? JSON.stringify(rest) : ''
  if (level === 'error') {
    console.error(consoleMsg, metaStr)
  } else if (level === 'warn') {
    console.warn(consoleMsg, metaStr)
  } else {
    console.log(consoleMsg, metaStr)
  }

  // Persist to DB — fire-and-forget, never throw
  prisma.systemLog
    .create({
      data: {
        level,
        service,
        message,
        meta: rest as object,
        userId,
        projectId,
        traceId,
      },
    })
    .catch((err) => {
      // Last-resort: only print to stderr, do NOT crash the caller
      console.error('[logger] Failed to persist log to DB:', err)
    })
}

export interface Logger {
  debug(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  warn(message: string, meta?: LogMeta): void
  error(message: string, meta?: LogMeta): void
}

/**
 * Returns a scoped logger bound to `service`.
 * All methods are fire-and-forget — they never block the caller.
 */
export function logger(service: string): Logger {
  return {
    debug: (message, meta) => { writeLog('debug', service, message, meta) },
    info:  (message, meta) => { writeLog('info',  service, message, meta) },
    warn:  (message, meta) => { writeLog('warn',  service, message, meta) },
    error: (message, meta) => { writeLog('error', service, message, meta) },
  }
}
