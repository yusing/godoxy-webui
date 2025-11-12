// localStorage operations
const STORAGE_PREFIX = 'godoxy:'

export { localStorageDelete, localStorageGet, localStorageSet }

/** Read from localStorage (JSON.parse) with prefix; undefined on SSR or error. */
function localStorageGet(key: string): unknown {
  try {
    if (typeof window === 'undefined') return undefined
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    return item ? JSON.parse(item) : undefined
  } catch (e) {
    console.error('Failed to get key from localStorage', key, e)
    return undefined
  }
}

/** Write to localStorage (JSON.stringify); remove key when value is undefined. */
function localStorageSet(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined') return
    if (value === undefined) {
      localStorage.removeItem(STORAGE_PREFIX + key)
    } else {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    }
  } catch (e) {
    console.error('Failed to set key in localStorage', key, value, e)
  }
}

/** Delete from localStorage with prefix. */
function localStorageDelete(key: string): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch (e) {
    console.error('Failed to delete key from localStorage', key, e)
  }
}
