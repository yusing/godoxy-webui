import { isEqual } from 'juststore'

export { getDiffs }

// getDiffs recursively compares two objects and returns an array of paths that differ
//
// @param orig - The original object to compare
// @param current - The current object to compare
// @returns An array of paths that differ (e.g. 'autocert.cert', 'autocert.key', 'acl.rules')
function getDiffs<T extends object>(
  orig: T | undefined,
  current: T | undefined,
  maxDepth = 3
): string[] {
  if (!orig || !current) return []

  const diffs = new Set<string>()

  const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (value === null || typeof value !== 'object') return false
    if (Array.isArray(value)) return false
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
  }

  const walk = (a: unknown, b: unknown, path: string, depth: number) => {
    if (isEqual(a, b)) return

    if (path) {
      diffs.add(path)
    }

    if (depth >= maxDepth) return
    if (!isPlainObject(a) || !isPlainObject(b)) return

    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) {
      const nextPath = path ? `${path}.${key}` : key
      walk(a[key], b[key], nextPath, depth + 1)
    }
  }

  walk(orig, current, '', 0)
  return Array.from(diffs)
}
