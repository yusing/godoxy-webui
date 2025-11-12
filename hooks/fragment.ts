import { usePathname } from 'next/navigation'
import { useMemo, useSyncExternalStore } from 'react'

function createFragmentStore(pathname: string) {
  let currentPathname = typeof window !== 'undefined' ? window.location.pathname : undefined

  function getSnapshot() {
    // Reset fragment when pathname changes
    if (currentPathname !== pathname) {
      currentPathname = pathname
      return undefined
    }
    return typeof window !== 'undefined' ? window.location.hash?.slice(1) : undefined
  }

  function subscribe(callback: () => void) {
    if (typeof window === 'undefined') {
      return () => {}
    }

    window.addEventListener('hashchange', callback)
    return () => {
      window.removeEventListener('hashchange', callback)
    }
  }

  return { getSnapshot, subscribe }
}

export function useFragment(): string | undefined {
  const pathname = usePathname()

  // Create a store instance for the current pathname
  const store = useMemo(() => createFragmentStore(pathname), [pathname])

  // Get the fragment from the external store
  const fragment = useSyncExternalStore(store.subscribe, store.getSnapshot, () => undefined)

  // decode the fragment to handle %20 etc
  const decodedFragment = useMemo(() => decodeURIComponent(fragment ?? ''), [fragment])

  if (!fragment) {
    // empty or undefined => undefined
    return undefined
  }
  return decodedFragment
}
