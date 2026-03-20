import { describe, expect, it } from 'bun:test'
import {
  CSRF_HEADER_NAME,
  CSRF_WEBSOCKET_PROTOCOL_PREFIX,
  getCSRFWebSocketProtocol,
  getCSRFToken,
  shouldAttachCSRF,
  withCSRFHeader,
} from '@/lib/csrf'

describe('csrf helpers', () => {
  it('reads and unquotes the csrf token from cookies', () => {
    expect(getCSRFToken('foo=bar; godoxy_csrf="abc.def"; baz=qux')).toBe('abc.def')
  })

  it('adds csrf header for unsafe methods only', () => {
    expect(withCSRFHeader({}, 'GET')).toEqual({})
    expect(withCSRFHeader({}, 'HEAD')).toEqual({})
    expect(withCSRFHeader({}, 'POST')).toEqual({})
    expect(shouldAttachCSRF('POST')).toBe(true)
    expect(shouldAttachCSRF('GET')).toBe(false)
  })

  it('adds csrf header when a token is available', () => {
    const originalDocument = globalThis.document
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { cookie: 'godoxy_csrf=token.value' },
    })

    try {
      expect(withCSRFHeader({}, 'POST')).toEqual({
        [CSRF_HEADER_NAME]: 'token.value',
      })
    } finally {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
      })
    }
  })

  it('formats the websocket csrf subprotocol', () => {
    expect(getCSRFWebSocketProtocol('token.value')).toBe(
      `${CSRF_WEBSOCKET_PROTOCOL_PREFIX}token.value`
    )
  })
})
