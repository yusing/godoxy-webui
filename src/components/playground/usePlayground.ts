import { useCallback, useState } from 'react'
import type { PlaygroundRequest } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { store } from './store'

export function usePlayground() {
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (request: PlaygroundRequest) => {
    setIsLoading(true)
    try {
      const response = await api.route.playground(request)
      store.playgroundResponse.set(response.data)
    } catch (error) {
      store.playgroundResponse.reset()
      toastError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    execute,
    isLoading,
  }
}
