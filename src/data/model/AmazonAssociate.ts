export class AmazonAssociate {
  constructor(
    readonly domain: string,
    readonly associateId: string
  ) {}

  isEnabled(): boolean {
    return (
      this.associateId !== '' && AmazonAssociate.isAmazonDomain(this.domain)
    )
  }

  buildAssociateUrlOrReturnAsIs(rawUrl: string): string {
    if (!this.isEnabled()) return rawUrl

    const url = new URL(rawUrl)
    if (url.hostname !== this.domain) return rawUrl

    const match = url.pathname.match(AmazonAssociate.PRODUCT_ID_REGEXP)
    if (!match) return rawUrl

    return `https://${url.hostname}/dp/${match[1]}/?tag=${this.associateId}`
  }

  static isAmazonDomain(domain: string): boolean {
    return AmazonAssociate.AMAZON_DOMAINS.indexOf(domain) >= 0
  }

  static empty(): AmazonAssociate {
    return new AmazonAssociate('', '')
  }

  private static PRODUCT_ID_REGEXP = /[^0-9A-Z]([B0-9][0-9A-Z]{9})([^0-9A-Z]|$)/

  static readonly AMAZON_DOMAINS = [
    'www.amazon.ae',
    'www.amazon.ca',
    'www.amazon.cn',
    'www.amazon.co.jp',
    'www.amazon.co.uk',
    'www.amazon.com',
    'www.amazon.com.au',
    'www.amazon.com.br',
    'www.amazon.com.mx',
    'www.amazon.com.tr',
    'www.amazon.de',
    'www.amazon.es',
    'www.amazon.fr',
    'www.amazon.in',
    'www.amazon.it',
    'www.amazon.nl',
    'www.amazon.sg',
  ]
}
