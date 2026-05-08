import { describe, expect, it } from 'vitest'
import { DefaultAmazonAssociateRepository } from './AmazonAssociateRepository'
import { DefaultConfigLocalGateway } from './ConfigLocalGateway'
import { InMemoryStorageDelegate } from '../test/InMemoryStorageDelegate'
import { AmazonAssociate } from './model/AmazonAssociate'
import { noopLogger } from '../Logger'

describe('DefaultAmazonAssociateRepository', () => {
  const buildRepo = () => {
    const storage = new InMemoryStorageDelegate()
    const gateway = new DefaultConfigLocalGateway(storage, noopLogger)
    const repo = new DefaultAmazonAssociateRepository(gateway)
    return { storage, gateway, repo }
  }

  it('returns an empty AmazonAssociate when nothing is saved', async () => {
    const { repo } = buildRepo()
    const value = await repo.get()
    expect(value.domain).toBe('')
    expect(value.associateId).toBe('')
    expect(value.isEnabled()).toBe(false)
  })

  it('round-trips a saved value', async () => {
    const { repo } = buildRepo()
    await repo.save(new AmazonAssociate('www.amazon.co.jp', 'my-tag-22'))
    const loaded = await repo.get()
    expect(loaded.domain).toBe('www.amazon.co.jp')
    expect(loaded.associateId).toBe('my-tag-22')
    expect(loaded.isEnabled()).toBe(true)
  })

  it('clear() reverts to empty', async () => {
    const { repo } = buildRepo()
    await repo.save(new AmazonAssociate('www.amazon.co.jp', 'my-tag-22'))
    await repo.clear()
    const loaded = await repo.get()
    expect(loaded.domain).toBe('')
    expect(loaded.associateId).toBe('')
  })

  it('exposes the supported Amazon domains', () => {
    const { repo } = buildRepo()
    expect(repo.getAmazonDomains()).toBe(AmazonAssociate.AMAZON_DOMAINS)
    expect(repo.getAmazonDomains().length).toBe(17)
  })
})
