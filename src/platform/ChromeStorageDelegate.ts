type ChromeStorage =
  | typeof chrome.storage.local
  | typeof chrome.storage.session
  | typeof chrome.storage.sync

type StorageValueType = string | number | object | null

export interface ChromeStorageDelegate {
  get<T extends { [key: string]: StorageValueType }>(
    keysAndDefaults: T
  ): Promise<T>
  save(data: { [key: string]: StorageValueType }): Promise<void>
  remove(keys: string[]): Promise<void>
}

export class DefaultChromeStorageDelegate implements ChromeStorageDelegate {
  constructor(private readonly storage: ChromeStorage) {}

  get<T extends { [key: string]: StorageValueType }>(
    keysAndDefaults: T
  ): Promise<{ [K in keyof T]: T[K] }> {
    const res = this.storage.get(keysAndDefaults)
    return res as Promise<{ [K in keyof T]: T[K] }>
  }
  save(data: { [key: string]: StorageValueType }): Promise<void> {
    return this.storage.set(data)
  }
  remove(keys: string[]): Promise<void> {
    return this.storage.remove(keys)
  }
}
