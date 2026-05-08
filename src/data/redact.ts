const SENSITIVE_KEYS: ReadonlySet<string> = new Set([
  'accessJwt',
  'refreshJwt',
  'password',
  'email',
])

const REDACTED = '[REDACTED]'

export function redactForLogging(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(redactForLogging)

  const result: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key) && v !== undefined && v !== null && v !== '') {
      result[key] = REDACTED
    } else {
      result[key] = redactForLogging(v)
    }
  }
  return result
}
