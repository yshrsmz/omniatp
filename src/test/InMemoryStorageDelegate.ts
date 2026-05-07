import { ChromeStorageDelegate } from '../platform/ChromeStorageDelegate'

type StorageValueType = string | number | boolean | object | null

export type StorageChange = {
  newValue?: StorageValueType
  oldValue?: StorageValueType
}

export class InMemoryStorageDelegate implements ChromeStorageDelegate {
  private store: Record<string, StorageValueType> = {}
  private listeners: Array<
    (changes: { [key: string]: StorageChange }) => void
  > = []

  async get<T extends { [key: string]: StorageValueType }>(
    keysAndDefaults: T
  ): Promise<T> {
    const result = { ...keysAndDefaults }
    for (const key of Object.keys(keysAndDefaults)) {
      if (key in this.store) {
        ;(result as Record<string, StorageValueType>)[key] = this.store[key]
      }
    }
    return result
  }

  async save(data: { [key: string]: StorageValueType }): Promise<void> {
    const changes: { [key: string]: StorageChange } = {}
    for (const [key, value] of Object.entries(data)) {
      changes[key] = { oldValue: this.store[key], newValue: value }
      this.store[key] = value
    }
    this.notify(changes)
  }

  async remove(keys: string[]): Promise<void> {
    const changes: { [key: string]: StorageChange } = {}
    for (const key of keys) {
      if (key in this.store) {
        changes[key] = { oldValue: this.store[key], newValue: undefined }
        delete this.store[key]
      }
    }
    if (Object.keys(changes).length > 0) {
      this.notify(changes)
    }
  }

  onChanged(
    listener: (changes: { [key: string]: StorageChange }) => void
  ): void {
    this.listeners.push(listener)
  }

  private notify(changes: { [key: string]: StorageChange }) {
    for (const listener of this.listeners) {
      listener(changes)
    }
  }

  // helpers for tests
  reset(): void {
    this.store = {}
    this.listeners = []
  }

  raw(): Record<string, StorageValueType> {
    return { ...this.store }
  }
}
