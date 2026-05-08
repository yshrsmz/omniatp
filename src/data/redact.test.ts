import { describe, it, expect } from 'vitest'
import { redactForLogging } from './redact'

describe('redactForLogging', () => {
  it('redacts top-level sensitive keys', () => {
    const input = {
      did: 'did:plc:abc',
      handle: 'alice.bsky.social',
      accessJwt: 'eyJhbGciOi...token',
      refreshJwt: 'eyJhbGciOi...refresh',
      email: 'alice@example.com',
      active: true,
    }

    expect(redactForLogging(input)).toEqual({
      did: 'did:plc:abc',
      handle: 'alice.bsky.social',
      accessJwt: '[REDACTED]',
      refreshJwt: '[REDACTED]',
      email: '[REDACTED]',
      active: true,
    })
  })

  it('redacts sensitive keys nested inside response wrappers', () => {
    const input = {
      success: true,
      data: {
        did: 'did:plc:abc',
        accessJwt: 'token',
        refreshJwt: 'refresh',
      },
    }

    expect(redactForLogging(input)).toEqual({
      success: true,
      data: {
        did: 'did:plc:abc',
        accessJwt: '[REDACTED]',
        refreshJwt: '[REDACTED]',
      },
    })
  })

  it('redacts sensitive keys inside arrays', () => {
    expect(redactForLogging([{ accessJwt: 'a' }, { accessJwt: 'b' }])).toEqual([
      { accessJwt: '[REDACTED]' },
      { accessJwt: '[REDACTED]' },
    ])
  })

  it('does not replace empty / nullish values to avoid masking absence', () => {
    const input = {
      accessJwt: '',
      refreshJwt: null,
      email: undefined,
    }

    expect(redactForLogging(input)).toEqual({
      accessJwt: '',
      refreshJwt: null,
      email: undefined,
    })
  })

  it('passes through primitives and nullish values', () => {
    expect(redactForLogging(undefined)).toBeUndefined()
    expect(redactForLogging(null)).toBeNull()
    expect(redactForLogging('plain')).toBe('plain')
    expect(redactForLogging(42)).toBe(42)
    expect(redactForLogging(true)).toBe(true)
  })

  it('leaves unrelated keys untouched', () => {
    const input = {
      did: 'did:plc:abc',
      handle: 'alice.bsky.social',
      status: 'active',
    }

    expect(redactForLogging(input)).toEqual(input)
  })
})
