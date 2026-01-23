import { store, type RouteKey } from '@/components/routes/store'
import type { RouteStatus } from '@/lib/api'
import { formatTimestamp } from '@/lib/format'
import { cn } from '@/lib/utils'
import { healthStatusColorsFg } from '@/types/health'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import isEqual from 'react-fast-compare'

export default function RouteUptimeBar({
  routeKey,
  className,
}: {
  routeKey: RouteKey
  className?: string
}) {
  const statuses = store.uptime[routeKey]?.statuses.use() ?? []
  const hideUptimeBar = store.displaySettings.hideUptimebar.use()

  if (hideUptimeBar) return null

  return <RouteUptimeBar_ statuses={statuses} className={className} />
}

const barWidth = 4 // w-1
const gap = 4 // gap-1

const RouteUptimeBar_ = memo(
  ({ statuses, className }: { statuses: RouteStatus[]; className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const calcMaxStatuses = useCallback(() => {
      if (!containerRef.current) return 0

      const containerWidth = containerRef.current.offsetWidth

      const calculatedMax = Math.floor(containerWidth / (barWidth + gap))

      const newMaxStatuses = Math.max(10, calculatedMax)
      return newMaxStatuses
    }, [containerRef])

    const [barsCount, setBarsCount] = useState(0)

    useEffect(() => {
      const updateBarsCount = () => {
        const newCount = calcMaxStatuses()
        if (newCount !== barsCount) {
          setBarsCount(newCount)
        }
      }

      // Initial calculation
      updateBarsCount()

      // Set up ResizeObserver to watch for container size changes
      let resizeObserver: ResizeObserver | null = null
      if (containerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          updateBarsCount()
        })
        resizeObserver.observe(containerRef.current)
      }

      // Fallback: listen to window resize events
      const handleWindowResize = () => {
        updateBarsCount()
      }
      window.addEventListener('resize', handleWindowResize)

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect()
        }
        window.removeEventListener('resize', handleWindowResize)
      }
    }, [calcMaxStatuses, barsCount])

    const displayStatuses = useMemo(() => statuses.slice(-barsCount), [statuses, barsCount])

    const unitWidth = barWidth + gap
    const height = 16 // h-4

    return (
      <div ref={containerRef} className={cn('relative h-4 min-w-0', className)}>
        {Array.from({ length: barsCount }).map((_, i) => {
          const left = i * unitWidth
          const status = displayStatuses[i]
          return (
            <div
              key={`bar-${i}-${status?.timestamp ?? 'empty'}`}
              className={cn(
                'absolute top-0 h-full bg-current',
                healthStatusColorsFg[status?.status ?? 'unknown']
              )}
              style={{ left, width: barWidth, borderRadius: barWidth / 2, height }}
              title={
                status
                  ? `${status.status} - ${formatTimestamp(status.timestamp)} - ${status.latency}ms`
                  : undefined
              }
            />
          )
        })}
      </div>
    )
  },
  isEqual
)

RouteUptimeBar_.displayName = 'RouteUptimeBar'
