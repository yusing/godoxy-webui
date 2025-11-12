import type { Prettify } from '@/components/ui/store/types'
import React from 'react'
import type { State } from './types'

export { createMixedState, type MixedState }

type MixedState<T extends readonly unknown[]> = Prettify<
  Pick<State<Readonly<T>>, 'value' | 'use' | 'Render' | 'Show'>
>

/**
 * Creates a mixed state that combines multiple states into a tuple.
 *
 * If one of the states is changed, the mixed state will be updated.
 *
 * @param states - Array of states to combine
 * @returns A new state that provides all values as a tuple
 *
 * @example
 * const mixedState = createMixedState(states.addLoading, states.copyLoading, state.agent)
 *
 * <mixedState.Render>
 *   {[addLoading, copyLoading, agent] => <SomeComponent />}
 * </mixedState.Render>
 */
function createMixedState<T extends readonly unknown[]>(
  ...states: { [K in keyof T]: State<T[K]> }
): MixedState<T> {
  const use = () => states.map(state => state.use()) as unknown as Readonly<T>
  const mixedState = {
    get value() {
      return states.map(state => state.value) as unknown as Readonly<T>
    },
    use,
    Render({ children }: { children: (value: Readonly<T>) => React.ReactNode }) {
      const value = use()
      return children(value)
    },
    Show({ children, on }: { children: React.ReactNode; on: (value: Readonly<T>) => boolean }) {
      const value = use()
      return on(value) ? children : null
    },
  } as const

  return mixedState as MixedState<T>
}
