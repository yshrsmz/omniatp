import { ConfigLocalGateway } from './ConfigLocalGateway'
import { AmazonAssociate } from './model/AmazonAssociate'

export interface AmazonAssociateRepository {
  get(): Promise<AmazonAssociate>
  save(value: AmazonAssociate): Promise<void>
  clear(): Promise<void>
  getAmazonDomains(): readonly string[]
}

export class DefaultAmazonAssociateRepository implements AmazonAssociateRepository {
  constructor(readonly localGateway: ConfigLocalGateway) {}

  async get(): Promise<AmazonAssociate> {
    const { domain, associateId } = await this.localGateway.getAmazonAssociate()
    return new AmazonAssociate(domain, associateId)
  }

  async save(value: AmazonAssociate): Promise<void> {
    await this.localGateway.saveAmazonAssociate({
      domain: value.domain,
      associateId: value.associateId,
    })
  }

  async clear(): Promise<void> {
    await this.localGateway.clearAmazonAssociate()
  }

  getAmazonDomains(): readonly string[] {
    return AmazonAssociate.AMAZON_DOMAINS
  }
}
