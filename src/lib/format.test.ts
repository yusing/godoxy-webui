import { describe, expect, test } from 'bun:test'
import { formatRoundedGoDuration } from './format'

const second = 1e9
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour

describe('formatRoundedGoDuration', () => {
  test.each([undefined, Number.NaN, Number.POSITIVE_INFINITY])(
    'hides unavailable duration %p',
    duration => {
      expect(formatRoundedGoDuration(duration)).toBe('')
    }
  )

  test.each([
    [0, ''],
    [400_000_000, '1s'],
    [44.4 * second, '44s'],
    [59.5 * second, '1m'],
    [89 * second, '1m'],
    [90 * second, '2m'],
    [59.5 * minute, '1h'],
    [90 * minute, '2h'],
    [23.5 * hour, '1d'],
    [36 * hour, '2d'],
  ])('formats %d nanoseconds as %s', (duration, expected) => {
    expect(formatRoundedGoDuration(duration)).toBe(expected)
  })
})
