import { describe, expect, it } from 'vitest'
import { DefaultPostTemplateRepository } from './PostTemplateRepository'
import { DefaultConfigLocalGateway } from './ConfigLocalGateway'
import { InMemoryStorageDelegate } from '../test/InMemoryStorageDelegate'
import { PostTemplate } from './model/PostTemplate'
import { noopLogger } from '../Logger'

describe('DefaultPostTemplateRepository', () => {
  const buildRepo = () => {
    const storage = new InMemoryStorageDelegate()
    const gateway = new DefaultConfigLocalGateway(storage, noopLogger)
    const repo = new DefaultPostTemplateRepository(gateway)
    return { storage, gateway, repo }
  }

  it('returns a PostTemplate built from the saved prefix', async () => {
    const { repo, gateway } = buildRepo()
    await gateway.savePostPrefix('NowReading: ')

    const template = await repo.get()

    expect(template).toBeInstanceOf(PostTemplate)
    expect(template.prefix).toBe('NowReading: ')
  })

  it('persists a PostTemplate via save()', async () => {
    const { repo, gateway } = buildRepo()

    await repo.save(new PostTemplate('Watching '))

    expect(await gateway.getPostPrefix()).toBe('Watching ')
  })

  it('clears the saved prefix via clear()', async () => {
    const { repo, gateway } = buildRepo()
    await repo.save(new PostTemplate('Watching '))

    await repo.clear()

    // gateway.getPostPrefix returns the default after clearing
    expect(await gateway.getPostPrefix()).toBe('NowBrowsing: ')
  })
})
