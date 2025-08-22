import { useMemo } from 'react'
import { useLocation } from 'react-use'

export function useFragment(): string | undefined {
  const location = useLocation()
  const fragment = useMemo(() => location.hash?.slice(1), [location.hash])
  if (fragment === '') {
    return undefined
  }
  return fragment
}
