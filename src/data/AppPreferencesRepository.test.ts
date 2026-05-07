import { describe, expect, it } from 'vitest'
import { DefaultAppPreferencesRepository } from './AppPreferencesRepository'
import { DefaultConfigLocalGateway } from './ConfigLocalGateway'
import { InMemoryStorageDelegate } from '../test/InMemoryStorageDelegate'

describe('DefaultAppPreferencesRepository', () => {
  const buildRepo = () => {
    const storage = new InMemoryStorageDelegate()
    const gateway = new DefaultConfigLocalGateway(storage)
    const repo = new DefaultAppPreferencesRepository(gateway)
    return { storage, gateway, repo }
  }

  it('reports false by default', async () => {
    const { repo } = buildRepo()
    expect(await repo.shouldCopyToClipboardOnPost()).toBe(false)
  })

  it('persists and reads back a true value', async () => {
    const { repo } = buildRepo()
    await repo.setCopyToClipboardOnPost(true)
    expect(await repo.shouldCopyToClipboardOnPost()).toBe(true)
  })

  it('persists and reads back a false value', async () => {
    const { repo } = buildRepo()
    await repo.setCopyToClipboardOnPost(true)
    await repo.setCopyToClipboardOnPost(false)
    expect(await repo.shouldCopyToClipboardOnPost()).toBe(false)
  })
})
