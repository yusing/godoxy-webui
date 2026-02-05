export {
  extractDockerTimestamp,
  extractLeadingTimestamp,
  formatLineForTerminal,
  parseJournalctlTimestamp,
  resolveThemeColors,
  resolveThemeColorsAsync,
}

function resolveThemeColors(): { background: string; foreground: string } {
  const root = document.documentElement
  const style = getComputedStyle(root)
  // Use CSS variables or fall back to Tailwind's muted foreground/background
  const foreground = style.getPropertyValue('--xterm-foreground').trim() || '#e2e8f0'
  const background = style.getPropertyValue('--xterm-background').trim() || '#0f172a'
  return { background, foreground }
}

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

async function resolveThemeColorsAsync(): Promise<{ background: string; foreground: string }> {
  await nextFrame()
  await nextFrame()
  return resolveThemeColors()
}

const timePart =
  '\\d{1,2}:\\d{1,2}(?::\\d{1,2})?(?:[.,]\\d+)?(?:\\s*[ap]m)?(?:\\s*(?:Z|[+-]\\d{2}:?\\d{2}|UTC|GMT))?'
const dateYmd = '\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}'
const dateDmy = '\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}'
const dateMd = '\\d{1,2}[-/.]\\d{1,2}'
const timestampPrefix = new RegExp(
  `^(?:\\u001b\\[[0-9;]*m)*(?:\\[\\s*\\]\\s*)?(?:\\[\\s*|\\(\\s*)?(?:${dateYmd}[T ,]+${timePart}|${dateYmd}|${dateDmy}(?:[ T,]+${timePart})?|${dateMd}(?:[ T,]+${timePart})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2}\\s+${timePart}(?:\\s+\\d{4})?|${timePart})(?:\\s*(?:\\]|\\)))?(?:\\u001b\\[[0-9;]*m)*\\s*`,
  'i'
)

const monthNames = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')

const journalctlRegex = /^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})/

function parseJournalctlTimestamp(line: string) {
  const match = line.match(journalctlRegex)
  if (!match) return null

  const [, month, dayStr, hourStr, minuteStr, secondStr] = match

  const monthIndex = monthNames.indexOf(month!)
  if (monthIndex === -1) return null

  const now = new Date()
  const year = now.getFullYear()

  const date = new Date(
    year,
    monthIndex,
    parseInt(dayStr!, 10),
    parseInt(hourStr!, 10),
    parseInt(minuteStr!, 10),
    parseInt(secondStr!, 10)
  )

  // Handle year wrap-around (log from January when current month is later)
  if (date > now && now.getMonth() < monthIndex) {
    date.setFullYear(year - 1)
  }

  return { date, match: match[0]! }
}

function extractDockerTimestamp(
  line: string
): { timestamp: string; date: Date; content: string } | null {
  const separatorIndex = line.indexOf(' ')
  if (separatorIndex <= 0) return null

  const timestamp = line.slice(0, separatorIndex)
  const date = new Date(timestamp)
  if (!Number.isFinite(date.getTime())) return null

  const content = line.slice(separatorIndex + 1)
  return { timestamp, date, content }
}

function extractLeadingTimestamp(line: string): string | null {
  const match = line.match(timestampPrefix)
  if (!match) return null
  return match[0]
}

const ansi = {
  reset: '\u001b[0m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
  black: '\u001b[30m',
  dim: '\u001b[2m',
  brightRed: '\u001b[91m',
  brightGreen: '\u001b[92m',
  brightYellow: '\u001b[93m',
  brightBlue: '\u001b[94m',
  brightCyan: '\u001b[96m',
  brightMagenta: '\u001b[95m',
} as const

const levelKeys = ['level', 'loglevel', 'severity']
const timestampKeys = ['time', 'timestamp', 'ts', '@timestamp', 'datetime']
const priorityKeys = [
  'sender',
  'component',
  'service',
  'msg',
  'message',
  'method',
  'proto',
  'uri',
  'path',
  'remote_addr',
  'local_addr',
  'request_id',
  'user_agent',
  'resp_status',
  'status',
  'resp_size',
  'elapsed_ms',
  'elapsed',
  'error',
  'err',
]
const logLevelPatterns: { regex: RegExp; color: string }[] = [
  { regex: /\[(FATAL|CRITICAL)\]/gi, color: ansi.brightRed },
  { regex: /\[(ERROR|ERR|SEVERE)\]/gi, color: ansi.red },
  { regex: /\[(WARN|WARNING)\]/gi, color: ansi.yellow },
  { regex: /\[(INFO|INFORMATION)\]/gi, color: ansi.green },
  { regex: /\[(DEBUG|DBG)\]/gi, color: ansi.blue },
  { regex: /\[(TRACE|TRC)\]/gi, color: ansi.dim },
  { regex: /\[(SUCCESS|OK|PASS)\]/gi, color: ansi.brightGreen },
]

function stripLeadingSeparator(value: string) {
  if (!value) return value
  const first = value[0]
  if (first === ' ' || first === '\t') {
    return value.slice(1)
  }
  return value
}

function stripLeadingTimestamp(value: string) {
  const match = extractLeadingTimestamp(value)
  if (!match) return value
  const trimmedMatch = match.trimEnd()
  return stripLeadingSeparator(value.slice(trimmedMatch.length))
}

function formatLineForTerminal(line: string, type: 'docker' | 'proxmox') {
  const dockerTimestamp = type === 'docker' ? extractDockerTimestamp(line) : null
  const ts = dockerTimestamp
    ? dockerTimestamp.timestamp
    : type !== 'docker'
      ? extractLeadingTimestamp(line)
      : null
  const date = dockerTimestamp ? dockerTimestamp.date : ts ? new Date(ts) : null
  const hasDate = date != null && Number.isFinite(date.getTime())

  const content = dockerTimestamp
    ? dockerTimestamp.content
    : ts
      ? stripLeadingSeparator(line.slice(ts.length))
      : line
  const normalizedContent = dockerTimestamp ? stripLeadingTimestamp(content) : content

  // For Proxmox journalctl logs, try to parse the journalctl format (e.g., "Jan 25 14:55:23")
  if (!hasDate && type === 'proxmox') {
    const ts = parseJournalctlTimestamp(line)
    if (ts && ts.match) {
      const body = formatLogContent(stripLeadingSeparator(line.slice(ts.match.length)), {
        hasExternalTimestamp: true,
      })
      return `${formatLocalDateTimeColored(ts.date)} ${body}`
    }
  }

  if (!hasDate) {
    return formatLogContent(normalizedContent, { hasExternalTimestamp: type !== 'proxmox' })
  }

  // Prepend a static timestamp. Use ANSI dim for readability without changing log colors.
  return `${formatLocalDateTimeColored(date)} ${formatLogContent(normalizedContent, { hasExternalTimestamp: true })}`
}

function formatLogContent(line: string, opts: { hasExternalTimestamp: boolean }): string {
  const formatted = tryFormatJsonLogLine(line, opts)
  return formatted ?? colorizeLogLevel(line)
}

function tryFormatJsonLogLine(
  line: string,
  opts: { hasExternalTimestamp: boolean }
): string | null {
  const firstBrace = line.indexOf('{')
  if (firstBrace === -1) return null

  const extracted = extractFirstJsonObject(line, firstBrace)
  if (!extracted) return null

  const { prefix, jsonText, suffix } = extracted

  const parsed = safeJsonParse(jsonText)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

  const obj = parsed as Record<string, unknown>

  const levelInfo = extractLevel(obj)
  const levelBadge = levelInfo ? formatLevelBadge(levelInfo.value) : ''

  const timeInfo = !opts.hasExternalTimestamp ? extractTimestamp(obj) : null
  const timestampPrefix = timeInfo ? `${formatLocalDateTimeColored(timeInfo)} ` : ''

  const excludeKeys = new Set<string>()
  if (levelInfo) excludeKeys.add(levelInfo.key)
  if (timeInfo) {
    for (const k of timestampKeys) excludeKeys.add(k)
  }

  const kv = formatJsonKv(obj, { excludeKeys })
  if (!kv) return null

  const renderedPrefix = prefix.trim() ? `${ansi.dim}${prefix.trim()}${ansi.reset} ` : ''
  const renderedSuffix = suffix.trim() ? ` ${ansi.dim}${suffix.trim()}${ansi.reset}` : ''

  const header = levelBadge ? `${levelBadge} ` : ''
  return `${timestampPrefix}${renderedPrefix}${header}${kv}${renderedSuffix}`.trimEnd()
}

function extractFirstJsonObject(
  line: string,
  startIndex: number
): { prefix: string; jsonText: string; suffix: string } | null {
  let depth = 0
  let inString = false
  let escaping = false

  for (let i = startIndex; i < line.length; i++) {
    const ch = line[i]!

    if (escaping) {
      escaping = false
      continue
    }
    if (inString) {
      if (ch === '\\') {
        escaping = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
      continue
    }

    if (ch === '{') {
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0) {
        const jsonText = line.slice(startIndex, i + 1)
        return {
          prefix: line.slice(0, startIndex),
          jsonText,
          suffix: line.slice(i + 1),
        }
      }
      if (depth < 0) return null
    }
  }

  return null
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function extractLevel(obj: Record<string, unknown>): { key: string; value: string } | null {
  for (const key of levelKeys) {
    const v = obj[key]
    if (typeof v === 'string' && v.trim()) return { key, value: v }
  }
  return null
}

function extractTimestamp(obj: Record<string, unknown>): Date | null {
  for (const key of timestampKeys) {
    const v = obj[key]
    if (typeof v === 'string') {
      const d = new Date(v)
      if (!Number.isNaN(d.getTime())) return d
    }
    if (typeof v === 'number' && Number.isFinite(v)) {
      // Heuristic: > 1e12 is ms, otherwise seconds.
      const ms = v > 1e12 ? v : v * 1000
      const d = new Date(ms)
      if (!Number.isNaN(d.getTime())) return d
    }
  }
  return null
}

function formatLevelBadge(levelRaw: string): string {
  const level = normalizeLevel(levelRaw)
  const color = colorForLevel(level)
  return `${color}[${level}]${ansi.reset}`
}

function normalizeLevel(levelRaw: string): string {
  const l = levelRaw.trim().toLowerCase()
  if (l === 'warning') return 'WARN'
  if (l === 'information') return 'INFO'
  if (l === 'critical') return 'FATAL'
  if (l === 'err') return 'ERROR'
  if (l === 'dbg') return 'DEBUG'
  if (l === 'trc') return 'TRACE'
  return l.toUpperCase()
}

function colorForLevel(level: string): string {
  switch (level) {
    case 'FATAL':
    case 'CRITICAL':
      return ansi.brightRed
    case 'ERROR':
    case 'ERR':
    case 'SEVERE':
      return ansi.red
    case 'WARN':
    case 'WARNING':
      return ansi.yellow
    case 'INFO':
    case 'INFORMATION':
      return ansi.green
    case 'DEBUG':
    case 'DBG':
      return ansi.blue
    case 'TRACE':
    case 'TRC':
      return ansi.dim
    case 'SUCCESS':
    case 'OK':
    case 'PASS':
      return ansi.brightGreen
    default:
      return ansi.cyan
  }
}

function formatJsonKv(
  obj: Record<string, unknown>,
  opts: {
    excludeKeys: Set<string>
  }
): string {
  const keys = Object.keys(obj)
  if (keys.length === 0) return ''

  const ordered = new Set<string>()
  for (const k of priorityKeys) {
    if (k in obj && !opts.excludeKeys.has(k)) ordered.add(k)
  }
  for (const k of keys) {
    if (!opts.excludeKeys.has(k)) ordered.add(k)
  }

  const parts: string[] = []
  for (const key of ordered) {
    const value = obj[key]
    if (value === undefined) continue
    parts.push(formatKvPair(key, value))
  }

  return parts.join(' ')
}

function formatKvPair(key: string, value: unknown): string {
  const keyColor = colorForKey(key)
  const sep = `${ansi.dim}=${ansi.reset}`

  // Special-case common HTTP-ish fields for readability.
  if ((key === 'resp_status' || key === 'status') && typeof value === 'number') {
    const statusColor =
      value >= 500
        ? ansi.red
        : value >= 400
          ? ansi.brightRed
          : value >= 300
            ? ansi.brightYellow
            : ansi.green
    return `${keyColor}${key}${ansi.reset}${sep}${statusColor}${value}${ansi.reset}`
  }

  return `${keyColor}${key}${ansi.reset}${sep}${formatKvValue(value)}`
}

function formatKvValue(value: unknown): string {
  if (value == null) return `${ansi.dim}null${ansi.reset}`

  if (typeof value === 'string') {
    return `"${escapeKvString(value)}"`
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  // Objects/arrays: compact JSON.
  try {
    return `"${escapeKvString(JSON.stringify(value))}"`
  } catch {
    return `"${escapeKvString(String(value))}"`
  }
}

function escapeKvString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
}

function colorForKey(key: string): string {
  // Stable, deterministic color per key for quick scanning.
  const palette = [
    ansi.brightCyan,
    ansi.brightYellow,
    ansi.brightGreen,
    ansi.brightBlue,
    ansi.brightMagenta,
  ]
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return palette[hash % palette.length]!
}

function colorizeLogLevel(line: string): string {
  // Log level patterns - case insensitive
  let result = line
  for (const { regex, color } of logLevelPatterns) {
    result = result.replace(regex, `${color}$&${ansi.reset}`)
  }

  return result
}

function formatLocalDateTimeColored(date: Date) {
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${ansi.dim}${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}${ansi.reset}`
}
