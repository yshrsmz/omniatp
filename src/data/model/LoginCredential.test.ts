import { describe, expect, it } from 'vitest'
import { suite } from './LoginCredential'

describe('LoginCredential.suite', () => {
  it('reports both fields as missing when nothing is provided', () => {
    const result = suite({})

    expect(result.isValid()).toBe(false)
    expect(result.hasErrors('identifier')).toBe(true)
    expect(result.hasErrors('password')).toBe(true)
  })

  it('uses the configured error messages', () => {
    const result = suite({})

    expect(result.getErrors('identifier')).toEqual(['Identifier is required'])
    expect(result.getErrors('password')).toEqual(['Password is required'])
  })

  it('reports only the missing field when one is provided', () => {
    const result = suite({ identifier: 'me.bsky.social' })

    expect(result.isValid()).toBe(false)
    expect(result.hasErrors('identifier')).toBe(false)
    expect(result.hasErrors('password')).toBe(true)
  })

  it('passes when both fields are non-blank', () => {
    const result = suite({
      identifier: 'me.bsky.social',
      password: 'hunter2',
    })

    expect(result.isValid()).toBe(true)
    expect(result.hasErrors()).toBe(false)
    expect(result.getErrors('identifier')).toEqual([])
    expect(result.getErrors('password')).toEqual([])
  })

  it('treats whitespace-only input as blank', () => {
    const result = suite({ identifier: '   ', password: '   ' })

    expect(result.hasErrors('identifier')).toBe(true)
    expect(result.hasErrors('password')).toBe(true)
  })

  it('treats undefined as blank when called with no argument', () => {
    const result = suite()

    expect(result.isValid()).toBe(false)
    expect(result.hasErrors('identifier')).toBe(true)
    expect(result.hasErrors('password')).toBe(true)
  })
})
