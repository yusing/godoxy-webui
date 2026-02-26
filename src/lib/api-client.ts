import { AxiosError } from 'axios'
import { useEffect, useRef } from 'react'
import { Api, type ErrorResponse } from '@/lib/api'

// this is for server side only, on client side we use relative path for middleware to handle
const apiAddr = process.env.GODOXY_API_ADDR ? `http://${process.env.GODOXY_API_ADDR}` : ''

export const api = new Api({
  baseURL: `${apiAddr}/api/v1`,
  secure: process.env.GODOXY_API_ADDR !== undefined && process.env.NODE_ENV === 'production',
  format: 'json',
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

type EndpointWithSignal<TQuery, TResponse, TParams extends object> = (
  query: TQuery,
  params?: TParams
) => Promise<TResponse>

type ParamsWithoutSignal<TParams extends object> = Omit<TParams, 'signal'>

export function useEndpoint<TQuery, TResponse, TParams extends { signal?: AbortSignal }>(
  endpoint: EndpointWithSignal<TQuery, TResponse, TParams>
) {
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
  }, [])

  const get = (query: TQuery, params?: ParamsWithoutSignal<TParams>) => {
    requestIdRef.current += 1
    const requestId = requestIdRef.current

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    return endpoint(query, {
      ...(params as TParams),
      signal: abortController.signal,
    }).then(
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
