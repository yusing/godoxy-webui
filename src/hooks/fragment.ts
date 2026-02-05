import { useCallback, useSyncExternalStore } from 'react'

export function useFragment(): string | undefined {
  const getSnapshot = useCallback(() => {
    // decode the fragment to handle %20 etc
    return typeof window !== 'undefined'
      ? decodeURIComponent(window.location.hash?.slice(1))
      : undefined
  }, [])

  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') {
      return () => {}
    }

    window.addEventListener('hashchange', callback)
    return () => {
      window.removeEventListener('hashchange', callback)
    }
  }, [])

  const fragment = useSyncExternalStore(subscribe, getSnapshot, () => undefined)
  return fragment
}
