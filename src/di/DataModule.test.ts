import { describe, expect, it } from 'vitest'
import { AtpAgent } from '@atproto/api'
import { DefaultDataModule } from './DataModule'
import { InMemoryStorageDelegate } from '../test/InMemoryStorageDelegate'
import { DefaultBskyRepository } from '../data/BskyRepository'
import { noopLogger } from '../Logger'

describe('DefaultDataModule', () => {
  it('memoizes the AtpAgent factory between calls', () => {
    const module = new DefaultDataModule(noopLogger)
    const factoryA = module.atpAgentFactory()
    const factoryB = module.atpAgentFactory()
    expect(factoryA).toBe(factoryB)
  })

  it('builds an AtpAgent with the provided options when invoked', () => {
    const module = new DefaultDataModule(noopLogger)
    const agent = module.atpAgentFactory()({
      service: 'https://example.com',
    })
    expect(agent).toBeInstanceOf(AtpAgent)
  })

  it('wires the AtpAgent factory into BskyRepository', () => {
    const module = new DefaultDataModule(noopLogger)
    const storage = new InMemoryStorageDelegate()
    const repo = module.bskyRepository(storage)
    expect(repo).toBeInstanceOf(DefaultBskyRepository)
    expect((repo as DefaultBskyRepository).agent).toBeInstanceOf(AtpAgent)
  })
})
