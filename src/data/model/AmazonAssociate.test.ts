import { describe, expect, it } from 'vitest'
import { AmazonAssociate } from './AmazonAssociate'

describe('AmazonAssociate', () => {
  describe('isAmazonDomain', () => {
    it('returns true for known regional domains', () => {
      expect(AmazonAssociate.isAmazonDomain('www.amazon.co.jp')).toBe(true)
      expect(AmazonAssociate.isAmazonDomain('www.amazon.com')).toBe(true)
      expect(AmazonAssociate.isAmazonDomain('www.amazon.de')).toBe(true)
    })

    it('returns false for non-Amazon domains', () => {
      expect(AmazonAssociate.isAmazonDomain('example.com')).toBe(false)
      expect(AmazonAssociate.isAmazonDomain('amazon.co.jp')).toBe(false)
    })
  })

  describe('isEnabled', () => {
    it('is false when associateId is empty', () => {
      expect(new AmazonAssociate('www.amazon.co.jp', '').isEnabled()).toBe(
        false
      )
    })

    it('is false when domain is not in the supported list', () => {
      expect(new AmazonAssociate('example.com', 'tag-22').isEnabled()).toBe(
        false
      )
    })

    it('is true when both domain and associateId are valid', () => {
      expect(
        new AmazonAssociate('www.amazon.co.jp', 'tag-22').isEnabled()
      ).toBe(true)
    })
  })

  describe('buildAssociateUrlOrReturnAsIs', () => {
    const associate = new AmazonAssociate('www.amazon.co.jp', 'my-tag-22')

    it('rewrites URLs to /dp/<ASIN>/?tag=<id> when domain matches', () => {
      const input =
        'https://www.amazon.co.jp/some-product-name/dp/B0DXXXXXX1/ref=foo?tag=other-22'
      expect(associate.buildAssociateUrlOrReturnAsIs(input)).toBe(
        'https://www.amazon.co.jp/dp/B0DXXXXXX1/?tag=my-tag-22'
      )
    })

    it('rewrites /gp/product/<ASIN>/ paths', () => {
      const input = 'https://www.amazon.co.jp/gp/product/0123456789/'
      expect(associate.buildAssociateUrlOrReturnAsIs(input)).toBe(
        'https://www.amazon.co.jp/dp/0123456789/?tag=my-tag-22'
      )
    })

    it('preserves the original string (including missing trailing slash) when not rewriting', () => {
      const input = 'https://example.com'
      expect(associate.buildAssociateUrlOrReturnAsIs(input)).toBe(input)
    })

    it('returns the URL unchanged when associateId is empty', () => {
      const empty = new AmazonAssociate('www.amazon.co.jp', '')
      const input = 'https://www.amazon.co.jp/dp/B0DXXXXXX1/'
      expect(empty.buildAssociateUrlOrReturnAsIs(input)).toBe(input)
    })

    it('returns the URL unchanged when the page domain differs from the configured one', () => {
      const input = 'https://www.amazon.com/dp/B0DXXXXXX1/'
      expect(associate.buildAssociateUrlOrReturnAsIs(input)).toBe(input)
    })

    it('returns the URL unchanged for a non-Amazon URL', () => {
      const input = 'https://example.com/path?foo=bar'
      expect(associate.buildAssociateUrlOrReturnAsIs(input)).toBe(input)
    })

    it('returns the URL unchanged for an Amazon page without an ASIN', () => {
      const input = 'https://www.amazon.co.jp/gp/help/customer/display'
      expect(associate.buildAssociateUrlOrReturnAsIs(input)).toBe(input)
    })
  })

  describe('AMAZON_DOMAINS', () => {
    it('lists 17 supported regional domains', () => {
      expect(AmazonAssociate.AMAZON_DOMAINS.length).toBe(17)
    })

    it('includes the major regional domains', () => {
      expect(AmazonAssociate.AMAZON_DOMAINS).toContain('www.amazon.co.jp')
      expect(AmazonAssociate.AMAZON_DOMAINS).toContain('www.amazon.com')
      expect(AmazonAssociate.AMAZON_DOMAINS).toContain('www.amazon.co.uk')
      expect(AmazonAssociate.AMAZON_DOMAINS).toContain('www.amazon.de')
    })
  })

  describe('empty()', () => {
    it('returns an instance with empty domain and id', () => {
      const empty = AmazonAssociate.empty()
      expect(empty.domain).toBe('')
      expect(empty.associateId).toBe('')
      expect(empty.isEnabled()).toBe(false)
    })
  })
})
