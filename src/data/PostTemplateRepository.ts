import { ConfigLocalGateway } from './ConfigLocalGateway'
import { PostTemplate } from './model/PostTemplate'

export interface PostTemplateRepository {
  get(): Promise<PostTemplate>
  save(template: PostTemplate): Promise<void>
  clear(): Promise<void>
}

export class DefaultPostTemplateRepository implements PostTemplateRepository {
  constructor(readonly localGateway: ConfigLocalGateway) {}

  async get(): Promise<PostTemplate> {
    const prefix = await this.localGateway.getPostPrefix()
    return new PostTemplate(prefix)
  }
  async save(template: PostTemplate): Promise<void> {
    await this.localGateway.savePostPrefix(template.prefix)
  }

  async clear(): Promise<void> {
    await this.localGateway.clearPostPrefix()
  }
}
