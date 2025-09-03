'use client'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { ErrorResponse } from './api'
import { formatError } from './api-client'

export function toastError<T extends string | Error | Event | ErrorResponse | AxiosError>(
  error: T
) {
  if (error instanceof Event) {
    toast.error('Websocket error')
  } else {
    const { message, error: err } = formatError(error)
    toast.error(`${message}${err ? `: ${err}` : ''}`)
  }
}
