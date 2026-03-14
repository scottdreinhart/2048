/**
 * crashLogger — dev-only crash and error logging.
 *
 * In production builds (import.meta.env.PROD) every function is a no-op and
 * the module tree-shakes cleanly. In development, errors are written to
 * localStorage (crash logs) and sessionStorage (fatal crashes) and echoed to
 * the console so they are visible in DevTools without any external service.
 */

const IS_DEV: boolean =
  typeof import.meta !== 'undefined' && (import.meta.env as Record<string, unknown>)?.DEV === true

type CrashLogLevel = 'error' | 'warn'

interface CrashLogEntry {
  timestamp: number
  area: string
  message: string
  details?: string
}

const STORAGE_KEY = 'app-crash-logs'
const FATAL_STORAGE_KEY = 'app-fatal-crash'
const LIMIT = 30

function stringifyDetails(details: unknown): string | undefined {
  if (!details) {
    return undefined
  }
  if (details instanceof Error) {
    return details.stack ?? details.message
  }
  try {
    return JSON.stringify(details)
  } catch {
    return String(details)
  }
}

function loadLogs(): CrashLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CrashLogEntry[]) : []
  } catch {
    return []
  }
}

function saveLogs(logs: CrashLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, LIMIT)))
  } catch {
    // no-op when storage unavailable
  }
}

export function logCrash(
  area: string,
  error: unknown,
  details?: unknown,
  level: CrashLogLevel = 'error',
): void {
  if (!IS_DEV) {
    return
  }
  const message = error instanceof Error ? error.message : String(error)
  const entry: CrashLogEntry = {
    timestamp: Date.now(),
    area,
    message,
    details: stringifyDetails(details),
  }
  saveLogs([entry, ...loadLogs()])
  if (level === 'warn') {
    console.warn(`[CrashLog:${area}]`, message, details)
  } else {
    console.error(`[CrashLog:${area}]`, message, details)
  }
}

export function getCrashLogs(): CrashLogEntry[] {
  return IS_DEV ? loadLogs() : []
}

export function clearCrashLogs(): void {
  if (!IS_DEV) {
    return
  }
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}

export function markFatalCrash(error: unknown): void {
  if (!IS_DEV) {
    return
  }
  const message = error instanceof Error ? error.message : String(error)
  try {
    sessionStorage.setItem(
      FATAL_STORAGE_KEY,
      JSON.stringify({ timestamp: Date.now(), message }),
    )
  } catch {
    // no-op
  }
}

export function getFatalCrash(): { timestamp: number; message: string } | null {
  if (!IS_DEV) {
    return null
  }
  try {
    const raw = sessionStorage.getItem(FATAL_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    const p = parsed as Record<string, unknown>
    return {
      timestamp: Number.isFinite(p['timestamp']) ? (p['timestamp'] as number) : Date.now(),
      message: typeof p['message'] === 'string' ? (p['message'] as string) : 'Unknown fatal crash',
    }
  } catch {
    return null
  }
}

export function clearFatalCrash(): void {
  if (!IS_DEV) {
    return
  }
  try {
    sessionStorage.removeItem(FATAL_STORAGE_KEY)
  } catch {
    // no-op
  }
}
