import { describe, expect, test } from 'bun:test'
import { asSearchValue, isIconURL } from './IconSearchField'

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

describe('asSearchValue', () => {
  test('reduces catalog icons to their reference', () => {
    expect(asSearchValue('@selfhst/immich.svg')).toBe('immich')
    expect(asSearchValue('@walkxcode/immich-dark.png')).toBe('immich')
    expect(asSearchValue('@selfhst/traffic-lights.webp')).toBe('traffic-lights')
  })

  test('keeps other values untouched', () => {
    expect(asSearchValue('https://example.com/icon.png')).toBe('https://example.com/icon.png')
    expect(asSearchValue('@target/favicon.ico')).toBe('@target/favicon.ico')
    expect(asSearchValue('immich')).toBe('immich')
  })
})
