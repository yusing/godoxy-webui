import { AxiosError } from 'axios'
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
