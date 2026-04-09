export type BufferedPrependListUpdater<TStored, TIncoming extends TStored = TStored> = ReturnType<
  typeof createBufferedPrependListUpdater<TStored, TIncoming>
>

type BufferedPrependListUpdaterOptions<TStored> = {
  limit: number
  throttleMs: number
  set: (updater: (prev: TStored[]) => TStored[]) => void
}

export function createBufferedPrependListUpdater<TStored, TIncoming extends TStored = TStored>({
  limit,
  throttleMs,
  set,
}: BufferedPrependListUpdaterOptions<TStored>) {
  let pendingItems: TIncoming[] = []
  let flushTimeout: ReturnType<typeof setTimeout> | null = null

  const flush = () => {
    if (flushTimeout) {
      clearTimeout(flushTimeout)
      flushTimeout = null
    }

    if (pendingItems.length === 0) {
      return
    }

    const batch = pendingItems
    pendingItems = []

    set(prev => {
      const nextItems: TStored[] = [...batch].toReversed()
      nextItems.push(...prev)
      return nextItems.slice(0, limit)
    })
  }

  return {
    enqueue(item: TIncoming) {
      pendingItems.push(item)
      if (flushTimeout) {
        return
      }

      flushTimeout = setTimeout(flush, throttleMs)
    },
    flush,
    clear() {
      if (flushTimeout) {
        clearTimeout(flushTimeout)
        flushTimeout = null
      }
      pendingItems = []
    },
  }
}
