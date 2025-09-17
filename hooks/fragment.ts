import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

export function useFragment(): string | undefined {
  const [fragment, setFragment] = useState<string | undefined>(
    typeof window !== 'undefined' ? window.location.hash?.slice(1) : undefined
  )

  const currentPathname = useRef(
    typeof window !== 'undefined' ? window.location.pathname : undefined
  )

  useEffect(() => {
    const onhashchange = () => {
      setFragment(window.location.hash?.slice(1))
    }
    window.addEventListener('hashchange', onhashchange)
    return () => {
      window.removeEventListener('hashchange', onhashchange)
    }
  }, [])

  const pathname = usePathname()

  useEffect(() => {
    // Reset fragment when navigating to a different pathname
    if (typeof window !== 'undefined') {
      if (currentPathname.current !== pathname) {
        currentPathname.current = pathname
        setFragment(undefined)
      }
    }
  }, [pathname])

  // decode the fragment to handle %20 etc
  const decodedFragment = useMemo(() => decodeURIComponent(fragment ?? ''), [fragment])

  if (!fragment) {
    // empty or undefined => undefined
    return undefined
  }
  return decodedFragment
}
