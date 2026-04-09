import { describe, expect, test } from 'bun:test'
import { createBufferedPrependListUpdater } from './event-list-buffer'

describe('createBufferedPrependListUpdater', () => {
  test('coalesces burst updates into a single prepend', () => {
    let items = ['older']
    let setCalls = 0

    const buffer = createBufferedPrependListUpdater<string>({
      limit: 5,
      throttleMs: 10,
      set: updater => {
        setCalls += 1
        items = updater(items)
      },
    })

    buffer.enqueue('first')
    buffer.enqueue('second')
    buffer.enqueue('third')

    expect(setCalls).toBe(0)

    buffer.flush()

    expect(setCalls).toBe(1)
    expect(items).toEqual(['third', 'second', 'first', 'older'])
  })

  test('flushes on the throttle boundary and keeps only the newest entries', async () => {
    let items = ['older-2', 'older-1']
    let setCalls = 0

    const buffer = createBufferedPrependListUpdater<string>({
      limit: 3,
      throttleMs: 5,
      set: updater => {
        setCalls += 1
        items = updater(items)
      },
    })

    buffer.enqueue('first')
    buffer.enqueue('second')

    await new Promise(resolve => setTimeout(resolve, 20))

    expect(setCalls).toBe(1)
    expect(items).toEqual(['second', 'first', 'older-2'])
  })
})
