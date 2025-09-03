'use client'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { ErrorResponse } from './api'
import { logger } from './logger'

export function toastError<T>(error: T) {
  if (error instanceof AxiosError) {
    const asResponseError = error.response?.data as ErrorResponse
    if (asResponseError && (asResponseError.error || asResponseError.message)) {
      toast.error(asResponseError.message ?? asResponseError.error)
    } else {
      toast.error(`HTTP Error ${error.response?.status ?? 'unknown'}`)
    }
  } else if (error instanceof Error) {
    toast.error('HTTP Error')
  } else if (error instanceof Event) {
    toast.error('Websocket error')
  } else {
    const asError = error as ErrorResponse
    if (asError.error || asError.message) {
      toast.error(asError.message ?? asError.error)
    } else {
      toast.error('Unknown error')
      logger.error(`unknown error type ${typeof error}`, error)
    }
  }
}
