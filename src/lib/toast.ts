import { toast } from 'sonner'
import type { ErrorResponse } from './api'
import { formatError } from './api-client'

export function toastError(error: string | Error | Event | ErrorResponse | unknown) {
  if (error instanceof Event) {
    toast.error('Websocket error', { duration: 3000 })
  } else {
    const { message, error: err } = formatError(error)
    toast.error(`${message}${err ? `: ${err}` : ''}`, { duration: 3000 })
  }
}
