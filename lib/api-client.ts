/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api, type ErrorResponse } from '@/lib/api'
import { AxiosError, type AxiosResponse } from 'axios'
import { logger } from './logger'

// this is for server side only, on client side we use relative path for middleware to handle
const apiAddr = process.env.GODOXY_API_ADDR ? `http://${process.env.GODOXY_API_ADDR}` : ''

export const api = new Api({
  baseURL: `${apiAddr}/api/v1`,
  secure: process.env.GODOXY_API_ADDR !== undefined && process.env.NODE_ENV === 'production',
  format: 'json',
})

export type ApiResponse<Data> =
  | {
      data: Data
      code: number
      headers: AxiosResponse['headers']
      error: null
    }
  | {
      data: null
      code: number
      headers: AxiosResponse['headers']
      error: ErrorResponse
    }

type ApiMethodParams<T extends (...args: any[]) => any> = T extends (...args: infer P) => unknown
  ? P
  : never

type ApiMethodData<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => Promise<AxiosResponse<infer D>>
  ? D
  : never

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

export async function callApi<Fn extends (...args: any[]) => Promise<AxiosResponse<any>>>(
  fn: Fn,
  ...args: ApiMethodParams<Fn>
): Promise<ApiResponse<ApiMethodData<Fn>>> {
  try {
    logger.debug('callApi', fn.name)
    const { data, status, headers } = await fn(...args)
    if (status >= 200 && status < 300) {
      return {
        data: data,
        code: status,
        error: null,
        headers: headers,
      }
    }
    logger.error('callApi', fn.name, status, data)
    return {
      data: null,
      code: status,
      error: formatError(data),
      headers: headers,
    }
  } catch (e) {
    if (e instanceof AxiosError) {
      logger.error('callApi', fn.name, e.response?.status, e.response?.data)
      return {
        data: null,
        code: e.response?.status ?? 500,
        error: formatError(e.response?.data),
        headers: e.response?.headers ?? {},
      }
    }
    logger.error('callApi', fn.name, e)
    return {
      data: null,
      code: 500,
      error: { message: 'Unknown error' },
      headers: {},
    }
  }
}
