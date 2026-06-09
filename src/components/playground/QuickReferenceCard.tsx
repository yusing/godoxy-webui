import { Search } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import cheatsheet from '@/generated/rules-cheatsheet.json'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'

type CheatsheetArg = {
  name: string
  description: string
}

type CheatsheetEntry = {
  id: string
  name: string
  kind: string
  summary?: string
  description?: string[]
  syntax?: string
  examples?: string[]
  args?: CheatsheetArg[]
  aliases?: string[]
  phase?: string
  terminates?: boolean
  supportedActions?: string[]
  tags?: string[]
}

type CheatsheetSection = {
  id: string
  title: string
  description?: string
  entries: CheatsheetEntry[]
}

type CheatsheetDocument = {
  sections: CheatsheetSection[]
}

const quickReference = cheatsheet as CheatsheetDocument

export default function QuickReferenceCard() {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) {
      return quickReference.sections
    }

    return quickReference.sections
      .map(section => ({
        ...section,
        entries: section.entries.filter(entry => matchesEntry(entry, normalizedQuery)),
      }))
      .filter(section => section.entries.length > 0)
  }, [normalizedQuery])

  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(
    () => quickReference.sections[0]?.id
  )

  useEffect(() => {
    if (filteredSections.length === 0) {
      return
    }
    setActiveSectionId(prev =>
      prev !== undefined && filteredSections.some(s => s.id === prev)
        ? prev
        : filteredSections[0]?.id
    )
  }, [filteredSections])

  const setSectionEl = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el)
    } else {
      sectionRefs.current.delete(id)
    }
  }, [])

  const syncActiveSectionFromScroll = useCallback(() => {
    const root = scrollRootRef.current
    if (!root || filteredSections.length === 0) return
    const ids = filteredSections.map(s => s.id)
    const next = pickQuickReferenceActiveSection(root, ids, sectionRefs.current)
    if (next !== undefined) {
      setActiveSectionId(prev => (prev === next ? prev : next))
    }
  }, [filteredSections])

  useLayoutEffect(() => {
    syncActiveSectionFromScroll()
  }, [syncActiveSectionFromScroll])

  useEffect(() => {
    const root = scrollRootRef.current
    if (!root || filteredSections.length === 0) return

    let raf = 0
    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        syncActiveSectionFromScroll()
      })
    }

    root.addEventListener('scroll', schedule, { passive: true })
    const ro = new ResizeObserver(schedule)
    ro.observe(root)
    schedule()

    return () => {
      root.removeEventListener('scroll', schedule)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [filteredSections, syncActiveSectionFromScroll])

  const scrollSectionIntoView = useCallback((id: string) => {
    sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <Card size="sm" className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="gap-2 px-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle>Quick Reference</CardTitle>
          <Badge variant="outline" className="shrink-0">
            {countEntries(filteredSections)} items
          </Badge>
        </div>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search className="pointer-events-none size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={event => setQuery(event.currentTarget.value)}
            placeholder="Search rule names, examples, variables..."
          />
        </InputGroup>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-4 pb-3 pt-0">
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row lg:gap-0">
          <ScrollArea
            className={cn(
              'min-h-0 shrink-0 rounded-md bg-muted/30',
              'max-h-[min(38vh,20rem)] min-h-36',
              'lg:max-h-none lg:h-auto lg:min-h-0 lg:w-50 lg:min-w-50 lg:max-w-50'
            )}
          >
            <div className="p-3">
              <div className="mb-2 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Sections
              </div>
              <nav className="space-y-1.5">
                {filteredSections.length > 0 ? (
                  filteredSections.map(section => {
                    const isActive = activeSectionId === section.id
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollSectionIntoView(section.id)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                          isActive
                            ? 'bg-primary/12 font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        <span>{section.title}</span>
                        <Badge variant={isActive ? 'secondary' : 'ghost'}>
                          {section.entries.length}
                        </Badge>
                      </button>
                    )
                  })
                ) : (
                  <p className="rounded-lg border border-dashed px-2 py-3 text-center text-xs text-muted-foreground">
                    No matching sections
                  </p>
                )}
              </nav>
            </div>
          </ScrollArea>

          <Separator orientation="vertical" className="hidden w-1 shrink-0 bg-ring lg:block" />

          <div
            ref={scrollRootRef}
            className="min-h-0 flex-1 overflow-y-auto rounded-md bg-muted/20 lg:min-w-0 lg:pl-3"
          >
            <div className="space-y-2 px-1 py-1">
              {filteredSections.length > 0 ? (
                filteredSections.map(section => {
                  const isActive = activeSectionId === section.id
                  return (
                    <section
                      key={section.id}
                      id={`quick-reference-${section.id}`}
                      ref={el => setSectionEl(section.id, el)}
                      data-section-id={section.id}
                      className={cn(
                        'rounded-lg px-3 py-4 transition-[background-color,box-shadow] duration-200',
                        isActive ? 'bg-background shadow-sm' : 'bg-muted/10'
                      )}
                    >
                      <header className="mb-2 border-border/50 border-b pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-foreground/90 text-sm tracking-wide uppercase">
                            {section.title}
                          </h3>
                          <Badge variant={isActive ? 'default' : 'outline'}>
                            {section.entries.length}
                          </Badge>
                        </div>
                        {section.description && (
                          <p className="mt-2 text-muted-foreground text-sm leading-snug">
                            {section.description}
                          </p>
                        )}
                      </header>

                      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-2">
                        {section.entries.map(entry => (
                          <QuickReferenceHoverRow key={entry.id} entry={entry} />
                        ))}
                      </div>
                    </section>
                  )
                })
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  No quick reference items matched <code>{query}</code>.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickReferenceHoverRow({ entry }: { entry: CheatsheetEntry }) {
  const subtitle = entryOneLineSubtitle(entry)

  return (
    <HoverCard>
      <HoverCardTrigger
        closeDelay={120}
        delay={220}
        render={
          <button
            type="button"
            className={cn(
              'col-span-full grid w-full min-w-0 cursor-help grid-cols-subgrid items-baseline gap-x-2 rounded-md px-2 py-1.25 text-left outline-none ring-offset-background transition-colors',
              'hover:bg-muted/55 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          />
        }
      >
        <code className="pointer-events-none select-none font-mono text-[13px] leading-snug font-semibold tracking-tight text-foreground">
          {entry.name}
        </code>
        <span className="pointer-events-none min-w-0 truncate text-[13px] leading-snug text-muted-foreground">
          {subtitle || '\u00a0'}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        side="left"
        sideOffset={10}
        className="max-h-[min(32rem,70vh)] w-[min(26rem,calc(100vw-1.75rem))] space-y-3 overflow-x-hidden overflow-y-auto p-3.5 shadow-lg"
      >
        <QuickReferenceEntryDetails entry={entry} />
      </HoverCardContent>
    </HoverCard>
  )
}

function QuickReferenceEntryDetails({ entry }: { entry: CheatsheetEntry }) {
  const descriptionLines = entryDescriptionLines(entry)

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <code className="rounded-md bg-muted/50 px-2 py-0.5 font-mono text-[12px] font-semibold text-foreground">
          {entry.name}
        </code>
        {entry.phase && <Badge variant={phaseBadgeVariant(entry.phase)}>{entry.phase}</Badge>}
        {entry.terminates ? <Badge variant="destructive">terminates</Badge> : null}
        <Badge variant="outline" className={cn('capitalize', cheatsheetKindBadgeClass(entry.kind))}>
          {entry.kind}
        </Badge>
      </div>

      {entry.syntax ? (
        <div>
          <div className="mb-1.5 font-semibold text-[10px] text-muted-foreground tracking-[0.18em] uppercase">
            Syntax
          </div>
          <pre className="overflow-x-auto rounded-md bg-muted/55 px-2.5 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {entry.syntax}
          </pre>
        </div>
      ) : null}

      <EntryDescription entryId={entry.id} lines={descriptionLines} />

      {entry.args && entry.args.length > 0 ? (
        <div>
          <div className="mb-2 font-semibold text-[10px] text-muted-foreground tracking-[0.18em] uppercase">
            Arguments
          </div>
          <div className="space-y-2">
            {entry.args.map(arg => (
              <div key={`${entry.id}-${arg.name}`} className="rounded-md bg-muted/35 px-2.5 py-2">
                <div className="font-mono text-[11px] font-semibold text-foreground">
                  {arg.name}
                </div>
                <div className="mt-1 text-muted-foreground text-xs leading-snug">
                  {arg.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {entry.examples && entry.examples.length > 0 ? (
        <div>
          <div className="mb-2 font-semibold text-[10px] text-muted-foreground tracking-[0.18em] uppercase">
            Examples
          </div>
          <div className="space-y-2">
            {entry.examples.map(example => (
              <pre
                key={`${entry.id}-${example}`}
                className="overflow-x-auto rounded-md bg-muted/45 px-2.5 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap"
              >
                {example}
              </pre>
            ))}
          </div>
        </div>
      ) : null}

      {entry.aliases?.length || entry.supportedActions?.length ? (
        <>
          <Separator className="my-2" />
          <div className="flex flex-wrap gap-2">
            {entry.aliases?.map(alias => (
              <MetaPill key={`${entry.id}-alias-${alias}`} label="alias" value={alias} />
            ))}
            {entry.supportedActions?.map(action => (
              <MetaPill key={`${entry.id}-action-${action}`} label="action" value={action} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

function entryOneLineSubtitle(entry: CheatsheetEntry): string {
  const sum = entry.summary?.trim()
  if (sum) return sum

  const lines = entryDescriptionLines(entry)

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (/^NOTE:/i.test(t)) continue
    if (t.startsWith('- ')) continue
    if (isLikelyDescriptionHeading(t)) continue
    return t
  }

  for (const line of lines) {
    const t = line.trim()
    if (!t.startsWith('- ')) continue
    return t.slice(2).trim()
  }

  return entry.kind?.trim() ?? ''
}

function entryDescriptionLines(entry: CheatsheetEntry): string[] {
  const lines = entry.description ?? []
  const sum = entry.summary?.trim()
  if (!sum || lines.length === 0) return lines
  if (lines[0]?.trim() === sum) return lines.slice(1)
  return lines
}

type DescBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'note'; paragraphs: string[] }
  | { kind: 'paragraph'; text: string }

function groupDescriptionLines(lines: string[]): DescBlock[] {
  const blocks: DescBlock[] = []
  let i = 0
  while (i < lines.length) {
    const raw = lines[i]
    if (raw === undefined) {
      i++
      continue
    }
    const line = raw.trim()
    if (!line) {
      i++
      continue
    }

    if (/^NOTE:/i.test(line)) {
      const paras: string[] = [raw.trimEnd()]
      i++
      while (i < lines.length) {
        const next = lines[i]
        if (next === undefined) break
        const nt = next.trim()
        if (!nt) break
        if (nt.startsWith('- ')) break
        if (isLikelyDescriptionHeading(nt)) break
        if (/^NOTE:/i.test(nt)) break
        paras.push(next.trimEnd())
        i++
      }
      blocks.push({ kind: 'note', paragraphs: paras })
      continue
    }

    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length) {
        const rawLine = lines[i]
        if (rawLine === undefined) break
        const t = rawLine.trim()
        if (!t.startsWith('- ')) break
        items.push(t.slice(2).trim())
        i++
      }
      blocks.push({ kind: 'bullets', items })
      continue
    }

    if (isLikelyDescriptionHeading(line)) {
      blocks.push({ kind: 'heading', text: line })
      i++
      continue
    }

    blocks.push({ kind: 'paragraph', text: line })
    i++
  }
  return blocks
}

function isLikelyDescriptionHeading(line: string): boolean {
  if (!line.endsWith(':')) return false
  if (line.startsWith('-')) return false
  if (/^NOTE:/i.test(line)) return false
  return true
}

function EntryDescription({ entryId, lines }: { entryId: string; lines: string[] }) {
  if (lines.length === 0) return null
  const blocks = groupDescriptionLines(lines)
  return (
    <div className="mt-3 space-y-3 text-sm">
      {blocks.map((block, i) => (
        <DescriptionBlock key={`${entryId}-desc-${i}`} block={block} />
      ))}
    </div>
  )
}

function DescriptionBlock({ block }: { block: DescBlock }) {
  switch (block.kind) {
    case 'heading':
      return (
        <div className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {block.text.replace(/:\s*$/, '')}
        </div>
      )
    case 'bullets':
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground marker:text-muted-foreground/70">
          {block.items.map((item, j) => (
            <li key={j} className="leading-relaxed">
              <AngleBracketParts text={item} />
            </li>
          ))}
        </ul>
      )
    case 'note':
      return (
        <div className="space-y-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2.5 text-muted-foreground">
          {block.paragraphs.map((para, j) => (
            <NoteParagraph key={j} text={para.trim()} isFirst={j === 0} />
          ))}
        </div>
      )
    case 'paragraph':
      return (
        <p className="leading-relaxed text-muted-foreground">
          <AngleBracketParts text={block.text} />
        </p>
      )
    default:
      return null
  }
}

function NoteParagraph({ text, isFirst }: { text: string; isFirst: boolean }) {
  if (!text) return null
  if (isFirst) {
    const m = text.match(/^(NOTE:\s*)([\s\S]*)$/i)
    if (m) {
      return (
        <p className="leading-relaxed">
          <span className="font-semibold text-foreground">{m[1]}</span>
          <AngleBracketParts text={m[2] ?? ''} />
        </p>
      )
    }
  }
  return (
    <p className="leading-relaxed">
      <AngleBracketParts text={text} />
    </p>
  )
}

function AngleBracketParts({ text }: { text: string }) {
  const segments = text.split(/(<[^>]+>)/g)
  return segments.map((seg, idx) =>
    /^<[^>]+>$/.test(seg) ? (
      <code
        key={idx}
        className="rounded bg-muted/70 px-1 py-px font-mono text-[13px] text-foreground"
      >
        {seg}
      </code>
    ) : (
      <span key={idx}>{seg}</span>
    )
  )
}

function pickQuickReferenceActiveSection(
  root: HTMLElement,
  orderedSectionIds: string[],
  sectionElements: Map<string, HTMLElement>
): string | undefined {
  if (orderedSectionIds.length === 0) return undefined

  const { scrollTop, scrollHeight, clientHeight } = root

  if (scrollHeight <= clientHeight + 1) {
    return orderedSectionIds[0]
  }

  const lastId = orderedSectionIds[orderedSectionIds.length - 1]!
  if (scrollHeight - scrollTop - clientHeight <= 48) {
    return lastId
  }

  const rootRect = root.getBoundingClientRect()
  const rootMid = (rootRect.top + rootRect.bottom) / 2

  let closestToMid: { id: string; dist: number } | null = null
  let largestVisible: { id: string; area: number } | null = null

  for (const id of orderedSectionIds) {
    const el = sectionElements.get(id)
    if (!el) continue

    const rect = el.getBoundingClientRect()
    const top = Math.max(rect.top, rootRect.top)
    const bottom = Math.min(rect.bottom, rootRect.bottom)
    const visible = Math.max(0, bottom - top)

    if (visible > 0 && (!largestVisible || visible > largestVisible.area)) {
      largestVisible = { id, area: visible }
    }
    if (visible < 12) continue

    const center = (rect.top + rect.bottom) / 2
    const dist = Math.abs(center - rootMid)
    if (!closestToMid || dist < closestToMid.dist) {
      closestToMid = { id, dist }
    }
  }

  return closestToMid?.id ?? largestVisible?.id ?? orderedSectionIds[0]
}

function countEntries(sections: CheatsheetSection[]) {
  return sections.reduce((sum, section) => sum + section.entries.length, 0)
}

function matchesEntry(entry: CheatsheetEntry, query: string) {
  const haystacks = [
    entry.name,
    entry.kind,
    entry.summary ?? '',
    entry.syntax ?? '',
    ...(entry.description ?? []),
    ...(entry.examples ?? []),
    ...(entry.aliases ?? []),
    ...(entry.supportedActions ?? []),
    ...(entry.tags ?? []),
    ...(entry.args ?? []).flatMap(arg => [arg.name, arg.description]),
  ]
  return haystacks.some(value => value.toLowerCase().includes(query))
}

function phaseBadgeVariant(phase: string) {
  switch (phase) {
    case 'pre':
      return 'secondary' as const
    case 'post':
      return 'outline' as const
    default:
      return 'ghost' as const
  }
}

function cheatsheetKindBadgeClass(kind: string) {
  switch (kind) {
    case 'matcher':
      return 'border-info/40 bg-info/20 text-info-foreground'
    case 'command':
      return 'border-success/40 bg-success/20 text-success-foreground'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/20 px-2 py-1 text-xs text-muted-foreground">
      <span className="uppercase tracking-[0.16em]">{label}</span>
      <code className="text-foreground">{value}</code>
    </span>
  )
}
