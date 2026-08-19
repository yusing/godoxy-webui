import { describe, expect, test } from 'bun:test'
import { isIconURL } from './IconSearchField'

describe('isIconURL', () => {
  test('accepts catalog, absolute, and relative icon urls', () => {
    expect(isIconURL('@selfhst/immich.svg')).toBe(true)
    expect(isIconURL('@walkxcode/nginx.png')).toBe(true)
    expect(isIconURL('https://example.com/icon.png')).toBe(true)
    expect(isIconURL('/favicon.ico')).toBe(true)
  })

  test('rejects search keywords and truncated catalog refs', () => {
    expect(isIconURL('immich')).toBe(false)
    expect(isIconURL('immich-server')).toBe(false)
    expect(isIconURL('@selfhst/immich')).toBe(false)
    expect(isIconURL('')).toBe(false)
  })
})
