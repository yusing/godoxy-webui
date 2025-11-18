import type { FieldValues } from '@/types/path'
import { useId } from 'react'
import { createRootNode } from './node'
import { createStoreRoot } from './root'
import type { DeepProxy, State } from './types'

export { useMemoryStore, type MemoryStore }

/**
 * A component local store with React bindings.
 *
 * - Dot-path addressing for nested values (e.g. "state.ui.theme").
 * - Immutable partial updates with automatic object/array creation.
 * - Fine-grained subscriptions built on useSyncExternalStore.
 * - Type-safe paths using FieldPath.
 * - Dynamic deep access via Proxy for ergonomic usage like `state.a.b.c.use()` and `state.a.b.c.set(v)`.
 */
type MemoryStore<T extends FieldValues> = State<T> & {
  [K in keyof T]: NonNullable<T[K]> extends object ? DeepProxy<T[K]> : State<T[K]>
}
/**
 * Create a memory store. The returned object is a Proxy that
 * exposes the base API (use/set/value/reset/...) and also allows deep, dynamic
 * access: e.g. `store.user.profile.name.use()` or `store.todos.at(0).title.set('x')`.
 */
function useMemoryStore<T extends FieldValues>(defaultValue: T): MemoryStore<T> {
  const memoryStoreId = useId()
  const namespace = `memory:${memoryStoreId}`
  const storeApi = createStoreRoot(namespace, defaultValue, {
    memoryOnly: true,
  })
  return createRootNode(storeApi) as MemoryStore<T>
}
