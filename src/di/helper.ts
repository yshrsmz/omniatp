export function getOrCreate<T>(
  defaultValue: T | undefined,
  creator: () => T,
  updater: (value: T) => void
): T {
  if (defaultValue === undefined) {
    const v = creator()
    updater(v)
    return v
  } else {
    return defaultValue
  }
}
