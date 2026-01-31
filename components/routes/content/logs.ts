export {
  extractDockerTimestamp,
  extractLeadingTimestamp,
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

async function resolveThemeColorsAsync(): Promise<{ background: string; foreground: string }> {
  return new Promise(resolve => {
    const scheduleResolve = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(resolveThemeColors())
        })
      })
    }
    scheduleResolve()
  })
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
