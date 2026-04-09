import { useEffect, useRef } from 'react'
import {
  Api,
  ContentType,
  type ErrorResponse,
  type FullRequestParams,
  type HttpResponse,
} from '@/lib/api'
import { withCSRFHeader } from '@/lib/csrf'

// this is for server side only, on client side we use relative path for middleware to handle
const apiAddr = process.env.GODOXY_API_ADDR ? `http://${process.env.GODOXY_API_ADDR}` : ''

function csrfFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const extra = withCSRFHeader({}, method)
  if (Object.keys(extra).length === 0) {
    return fetch(input, init)
  }
  const headers = new Headers(init?.headers ?? undefined)
  for (const [key, value] of Object.entries(extra)) {
    headers.set(key, value)
  }
  return fetch(input, { ...init, headers })
}

function createApi(): Api {
  const client = new Api({
    baseUrl: `${apiAddr}/api/v1`,
    customFetch: csrfFetch,
    baseApiParams: {
      secure: process.env.GODOXY_API_ADDR !== undefined && process.env.NODE_ENV === 'production',
      format: 'json',
    },
  })
  const request = client.request.bind(client)
  client.request = (async (params: FullRequestParams) => {
    const effective =
      params.type === undefined && typeof params.body === 'string'
        ? { ...params, type: ContentType.Text }
        : params
    return request(effective)
  }) as typeof client.request
  return client
}

export const api = createApi()

export function isFetchApiError(err: unknown): err is HttpResponse<unknown, unknown> {
  return (
    err !== null &&
    typeof err === 'object' &&
    'ok' in err &&
    typeof (err as Response).ok === 'boolean' &&
    (err as Response).ok === false
  )
}

export function formatError(data: unknown): ErrorResponse {
  if (isFetchApiError(data)) {
    const body = data.error
    if (body !== null && typeof body === 'object' && 'message' in body) {
      return body as ErrorResponse
    }
    if (typeof body === 'string') {
      return { message: body }
    }
    if (body instanceof Error) {
      return { message: body.message }
    }
    return { message: data.statusText || 'Request failed' }
  }
  if (typeof data === 'object' && data !== null) {
    if (data instanceof Error) {
      return { message: data.message }
    }
    if ('message' in data && typeof (data as ErrorResponse).message === 'string') {
      return data as ErrorResponse
    }
  }
  if (typeof data === 'string') {
    return { message: data }
  }
  return { message: String(data) }
}

export function formatErrorString(data: unknown): string {
  const error = formatError(data)
  return `${error.message}${error.error ? `: ${error.error}` : ''}`
}

const neverSettled = new Promise<never>(() => {})

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

type StripSignalFromLastArg<TArgs extends unknown[]> = TArgs extends [...infer Prefix, infer Last]
  ? Last extends object | undefined
    ? undefined extends Last
      ? [...Prefix, Omit<Exclude<Last, undefined>, 'signal'>?]
      : [...Prefix, Omit<Last, 'signal'>]
    : TArgs
  : TArgs

export function useEndpoint<TArgs extends unknown[], TResult>(
  endpoint: (...args: TArgs) => Promise<TResult>
) {
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
  }, [])

  const get = (...args: StripSignalFromLastArg<TArgs>): Promise<TResult> => {
    const inputArgs = args as unknown[]
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    let endpointArgs: unknown[]
    if (inputArgs.length > endpoint.length) {
      const params = inputArgs[inputArgs.length - 1] as Record<string, unknown>
      endpointArgs = [
        ...inputArgs.slice(0, -1),
        {
          ...params,
          signal: abortController.signal,
        },
      ]
    } else {
      endpointArgs = [...inputArgs, { signal: abortController.signal }]
    }

    return endpoint(...(endpointArgs as TArgs)).then(
      response => {
        if (requestId !== requestIdRef.current) {
          return neverSettled
        }
        return response
      },
      error => {
        if (requestId !== requestIdRef.current || isAbortError(error)) {
          return neverSettled
        }
        throw error
      }
    )
  }

  return { get }
}
