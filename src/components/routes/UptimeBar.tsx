import { isEqual } from 'juststore'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type RouteKey, store } from '@/components/routes/store'
import type { RouteStatus } from '@/lib/api'
import { formatTimestamp } from '@/lib/format'
import { cn } from '@/lib/utils'

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

const barWidth = 6
const gap = 2
const barHeight = 18

const uptimeBarStatusClass: Record<RouteStatus['status'] | 'unknown', string> = {
  healthy: 'routes-uptime-bar-healthy',
  unhealthy: 'routes-uptime-bar-unhealthy',
  napping: 'routes-uptime-bar-napping',
  starting: 'routes-uptime-bar-starting',
  unknown: 'routes-uptime-bar-unknown',
}

const RouteUptimeBar_ = memo(
  ({ statuses, className }: { statuses: RouteStatus[]; className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const calcMaxStatuses = useCallback(() => {
      if (!containerRef.current) return 0

      const containerWidth = containerRef.current.offsetWidth

      const calculatedMax = Math.floor((containerWidth + gap) / (barWidth + gap))

      const newMaxStatuses = Math.max(12, calculatedMax)
      return newMaxStatuses
    }, [])

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

    return (
      <div
        ref={containerRef}
        className={cn('flex min-w-0 items-stretch gap-[2px]', className)}
        style={{ height: barHeight }}
      >
        {Array.from({ length: barsCount }).map((_, i) => {
          const status = displayStatuses[i]
          return (
            <div
              key={`bar-${i}-${status?.timestamp ?? 'empty'}`}
              className={cn(
                'routes-uptime-bar shrink-0 rounded-[2px]',
                uptimeBarStatusClass[status?.status ?? 'unknown']
              )}
              style={{ width: barWidth, height: barHeight }}
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
