/**
 * Query class for building URL search params for GoDoxy API requests
 *
 * It supports multiple values for the same key by adding multiple k=v pairs for the same key.
 */
export class Query {
  private query: Map<string, string[]>

  constructor() {
    this.query = new Map()
  }

  add(key: string, value: string) {
    if (!key) throw new Error('Key is required')
    if (this.query.has(key)) {
      this.query.get(key)!.push(value)
    } else {
      this.query.set(key, [value])
    }
  }

  addAll(key: string, values: string[]) {
    if (!key) throw new Error('Key is required')
    if (this.query.has(key)) {
      this.query.get(key)!.push(...values)
    } else {
      this.query.set(key, values)
    }
  }

  toString() {
    if (this.query.size === 0) return ''
    let result = ''
    for (const [key, values] of this.query.entries()) {
      for (const value of values) {
        result += `${key}=${value}&`
      }
    }
    return result.slice(0, -1)
  }
}