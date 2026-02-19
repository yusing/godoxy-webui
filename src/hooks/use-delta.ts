import { useEffect, useRef } from 'react'

export function useDelta(value: number | null | undefined, resetKey?: unknown): number | undefined {
  const prevRef = useRef<number | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to reset the previous value when the resetKey changes
  useEffect(() => {
    prevRef.current = null
  }, [resetKey])

  useEffect(() => {
    if (value === null || value === undefined || !Number.isFinite(value)) return
    prevRef.current = value
  }, [value])

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value) ||
    prevRef.current === null
  ) {
    return undefined
  }
  return value - prevRef.current
}

export function usePercentageDelta(
  value: number | null | undefined,
  resetKey?: unknown
): number | undefined {
  const prevRef = useRef<number | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to reset the previous value when the resetKey changes
  useEffect(() => {
    prevRef.current = null
  }, [resetKey])

  useEffect(() => {
    if (value === null || value === undefined || !Number.isFinite(value)) return
    prevRef.current = value
  }, [value])

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value) ||
    prevRef.current === null ||
    prevRef.current === 0
  ) {
    return undefined
  }
  return ((value - prevRef.current) / prevRef.current) * 100
}
