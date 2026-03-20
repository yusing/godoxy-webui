import { AxiosError, AxiosHeaders } from 'axios'
import { useEffect, useRef } from 'react'
import { Api, type ErrorResponse } from '@/lib/api'
import { withCSRFHeader } from '@/lib/csrf'

// this is for server side only, on client side we use relative path for middleware to handle
const apiAddr = process.env.GODOXY_API_ADDR ? `http://${process.env.GODOXY_API_ADDR}` : ''

export const api = new Api({
  baseURL: `${apiAddr}/api/v1`,
  secure: process.env.GODOXY_API_ADDR !== undefined && process.env.NODE_ENV === 'production',
  format: 'json',
})

api.instance.interceptors.request.use(config => {
  const headers = withCSRFHeader({}, config.method)
  if (Object.keys(headers).length === 0) {
    return config
  }
  const nextHeaders = AxiosHeaders.from(config.headers)
  for (const [key, value] of Object.entries(headers)) {
    nextHeaders.set(key, value)
  }
  config.headers = nextHeaders
  return config
})

export function formatError(data: AxiosError | ErrorResponse | string): ErrorResponse {
  if (data instanceof AxiosError) {
    if (data.response) {
      if (typeof data.response.data === 'object') {
        return data.response.data as ErrorResponse
      }
      if (typeof data.response.data === 'string') {
        return { message: data.response.data }
      }
      return { message: data.message }
    }
  }
  if (typeof data === 'object') {
    if (data instanceof Error) {
      return { message: data.message }
    }
    return data as ErrorResponse
  }
  return { message: data }
}

export function formatErrorString(data: AxiosError | ErrorResponse | string): string {
  const error = formatError(data)
  return `${error.message}${error.error ? `: ${error.error}` : ''}`
}

const neverSettled = new Promise<never>(() => {})

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof AxiosError && error.code === 'ERR_CANCELED') ||
    (error instanceof DOMException && error.name === 'AbortError')
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
