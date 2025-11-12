import type { FieldValues } from '@/types/path'
import { createRootNode } from './node'
import { createStoreRoot, type StoreOptions } from './root'
import type { DeepProxy, State, StoreRoot } from './types'

export { createStore, type Store }

/**
 * A persistent, hierarchical, cross-tab synchronized key-value store with React bindings.
 *
 * - Dot-path addressing for nested values (e.g. "config.ui.theme").
 * - Immutable partial updates with automatic object/array creation.
 * - Persists root namespaces to localStorage with an in-memory mirror (no localStorage on SSR).
 * - Cross-tab synchronization via BroadcastChannel (no-ops on SSR).
 * - Fine-grained subscriptions built on useSyncExternalStore.
 * - Type-safe paths using FieldPath.
 * - Dynamic deep access via Proxy for ergonomic usage like `store.a.b.c.use()` and `store.a.b.c.set(v)`.
 */
type Store<T extends FieldValues> = StoreRoot<T> & {
  [K in keyof T]: NonNullable<T[K]> extends object ? DeepProxy<T[K]> : State<T[K]>
}

function createStore<T extends FieldValues>(
  namespace: string,
  defaultValue: T,
  options: StoreOptions = {}
): Store<T> {
  const storeApi = createStoreRoot<T>(namespace, defaultValue, options)
  return new Proxy(storeApi, {
    get(target, prop) {
      if (prop in target) {
        return target[prop as keyof typeof target]
      }
      if (typeof prop === 'string' || typeof prop === 'number') {
        return createRootNode(target, prop)
      }
      return undefined
    },
  }) as Store<T>
}
