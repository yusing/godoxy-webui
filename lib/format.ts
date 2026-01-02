export function formatPercent(value: number) {
  return `${Math.round(value * 10000) / 100}%`
}

export function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString()
}

export function formatShortTime(ts?: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatPrecision(value: number, precision: number) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export function formatDuration(dur: number, options?: { unit?: 'us' | 'ms' | 's' }): string {
  const { unit = 's' } = options ?? {}
  if (dur < 0) {
    return 'n/a'
  }
  // Convert input to microseconds
  let ns: number
  switch (unit) {
    case 'us':
      ns = dur
      break
    case 'ms':
      ns = dur * 1e3
      break
    case 's':
    default:
      ns = dur * 1e6
      break
  }

  let negative = false
  if (ns < 0) {
    negative = true
    ns = -ns
  }

  if (ns === 0) {
    return '0s'
  }

  if (ns < 1e3) {
    // < 1 ms
    return `${negative ? '-' : ''}${ns}us`
  }
  if (ns < 1e6) {
    // < 1 s
    const ms = Math.floor(ns / 1e3)
    return `${negative ? '-' : ''}${ms}ms`
  }

  // >= 1 s
  const totalSeconds = Math.floor(ns / 1e6)
  const days = Math.floor(totalSeconds / (24 * 3600))
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  if (seconds > 0 && totalSeconds < 3600) {
    parts.push(`${seconds}s`)
  }

  const result = parts.join(' ')
  return (negative ? '-' : '') + result
}

const units = ['B', 'KB', 'MB', 'GB', 'TB']

export function formatBytes(value?: number | null, params?: { precision?: number; unit?: string }) {
  if (!value) return `0 B${params?.unit ?? ''}`
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index++
  }
  return `${formatPrecision(value, params?.precision ?? 0)} ${units[index]}${params?.unit ?? ''}`
}

export function formatTemperature(value: number, unit?: 'celsius' | 'fahrenheit') {
  if (unit === 'fahrenheit') {
    return `${toFahrenheit(value).toFixed(0)} °F`
  }
  return `${value.toFixed(0)} °C`
}

export function toFahrenheit(celsius: number) {
  return celsius * 1.8 + 32
}

export function formatRelTime(t: Date | number | null, ref: Date | number = new Date()): string {
  if (!t || (typeof t === 'number' && t <= 0)) return 'never'

  const toDate = (v: Date | number): Date => {
    if (v instanceof Date) return v
    const ms = v > 1e12 ? v : v * 1000
    return new Date(ms)
  }

  const tTime = toDate(t)
  if (Number.isNaN(tTime.getTime())) return 'never'

  const refTime = toDate(ref)
  const diff = tTime.getTime() - refTime.getTime()
  const absDiff = Math.abs(diff)

  const round = (value: number) => Math.round(value)

  if (absDiff < 1000) return 'now'

  if (absDiff < 3 * 1000) {
    if (diff < 0) return 'just now'
  }

  if (absDiff < 60 * 1000) {
    const seconds = absDiff / 1000
    return diff < 0 ? `${round(seconds)} seconds ago` : `in ${round(seconds)} seconds`
  }

  if (absDiff < 60 * 60 * 1000) {
    const minutes = absDiff / (60 * 1000)
    return diff < 0 ? `${round(minutes)} minutes ago` : `in ${round(minutes)} minutes`
  }

  if (absDiff < 24 * 60 * 60 * 1000) {
    const hours = absDiff / (60 * 60 * 1000)
    return diff < 0 ? `${round(hours)} hours ago` : `in ${round(hours)} hours`
  }

  const pad2 = (n: number) => String(n).padStart(2, '0')
  const timePart = `${pad2(tTime.getHours())}:${pad2(tTime.getMinutes())}:${pad2(tTime.getSeconds())}`
  const mdPart = `${pad2(tTime.getMonth() + 1)}-${pad2(tTime.getDate())}`

  if (tTime.getFullYear() === refTime.getFullYear()) {
    return `${mdPart} ${timePart}`
  }
  return `${tTime.getFullYear()}-${mdPart} ${timePart}`
}

export function providerName(name: string) {
  if (name.endsWith('!')) {
    return name.slice(0, -1)
  }
  return name
}
