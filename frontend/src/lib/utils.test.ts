import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('should handle arrays', () => {
    const result = cn(['foo', 'bar'])
    expect(result).toBe('foo bar')
  })

  it('should handle objects', () => {
    const result = cn({ foo: true, bar: false })
    expect(result).toBe('foo')
  })

  it('should handle mixed inputs', () => {
    const result = cn('foo', ['bar', 'baz'], { qux: true })
    expect(result).toBe('foo bar baz qux')
  })

  it('should handle empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle tailwind merge conflicts', () => {
    const result = cn('px-2 px-4', 'py-1 py-2')
    expect(result).toBe('px-4 py-2')
  })
})