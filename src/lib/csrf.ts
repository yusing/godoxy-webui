export const CSRF_COOKIE_NAME = 'godoxy_csrf'
export const CSRF_HEADER_NAME = 'X-CSRF-Token'
export const CSRF_WEBSOCKET_PROTOCOL_PREFIX = 'csrf.'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function getCSRFToken(cookieHeader = getDocumentCookie()): string | null {
  if (!cookieHeader) {
    return null
  }

  for (const rawPart of cookieHeader.split(';')) {
    const part = rawPart.trim()
    if (!part.startsWith(`${CSRF_COOKIE_NAME}=`)) {
      continue
    }
    const value = part.slice(CSRF_COOKIE_NAME.length + 1).trim()
    if (!value) {
      return null
    }
    return stripQuotes(decodeURIComponent(value))
  }

  return null
}

export function withCSRFHeader(
  headers: Record<string, string> = {},
  method?: string
): Record<string, string> {
  if (!shouldAttachCSRF(method)) {
    return headers
  }

  const token = getCSRFToken()
  if (!token) {
    return headers
  }

  return {
    ...headers,
    [CSRF_HEADER_NAME]: token,
  }
}

export function getCSRFWebSocketProtocol(token = getCSRFToken()): string | null {
  if (!token) {
    return null
  }
  return `${CSRF_WEBSOCKET_PROTOCOL_PREFIX}${token}`
}

export function shouldAttachCSRF(method?: string): boolean {
  if (!method) {
    return true
  }
  return !SAFE_METHODS.has(method.toUpperCase())
}

function getDocumentCookie(): string {
  if (typeof document === 'undefined') {
    return ''
  }
  return document.cookie
}

function stripQuotes(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1)
  }
  return value
}
