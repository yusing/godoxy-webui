import { createAtom } from 'juststore'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { useCallback, useEffect, useId, useRef } from 'react'
import { cn } from '@/lib/utils'

export type SectionId = string

export type SectionItem<T extends SectionId = SectionId> = {
  id: T
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  show: boolean
}

type SectionedFormProps<T extends SectionId> = {
  sections: SectionItem<T>[]
  defaultSection?: T
  dialog?: boolean
  children: (contentProps: { contentRef: React.RefObject<HTMLDivElement | null> }) => ReactNode
  className?: string
}

// Tracks the active section based on scroll position and manual navigation.
// Adds light wheel snapping between sections while preserving normal smooth scroll.
function useSectionTracker<T extends SectionId>(sections: SectionItem<T>[], defaultSection?: T) {
  'use memo'

  const activeSection = createAtom<T | undefined>(useId(), defaultSection ?? sections[0]?.id)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const manualTargetRef = useRef<{ id: T; until: number } | null>(null)
  const scrollSnapRef = useRef<{ value: number; time: number }[]>([])

  const getEffectiveActiveSection = useCallback(
    (current: T | undefined) => {
      const effective = sections.find(s => s.show && s.id === current)
      const fallback = sections.find(s => s.show)
      return effective?.id ?? fallback?.id ?? undefined
    },
    [sections]
  )

  useEffect(() => {
    const contentEl = contentRef.current
    if (!contentEl) return

    const getCandidates = () =>
      Array.from(contentEl.querySelectorAll<HTMLElement>('[data-section]')).filter(
        el => el.offsetParent !== null
      )

    const getScrollRoot = () => {
      let node: HTMLElement | null = contentEl
      while (node && node !== document.body) {
        const style = getComputedStyle(node)
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
          return node
        }
        node = node.parentElement
      }
      return document.documentElement
    }

    const scrollRoot = getScrollRoot()
    const isWindowRoot = scrollRoot === document.documentElement

    const getViewport = () => {
      if (isWindowRoot) {
        return {
          scrollTop: window.scrollY,
          height: window.innerHeight,
          scrollHeight: document.documentElement.scrollHeight,
        }
      }

      return {
        scrollTop: scrollRoot.scrollTop,
        height: scrollRoot.clientHeight,
        scrollHeight: scrollRoot.scrollHeight,
      }
    }

    const getSectionTop = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      if (isWindowRoot) return rect.top + window.scrollY
      const rootRect = scrollRoot.getBoundingClientRect()
      return rect.top - rootRect.top + scrollRoot.scrollTop
    }

    let rafId = 0
    const updateActiveSection = () => {
      const { scrollTop, height, scrollHeight } = getViewport()
      const focusY = scrollTop + height * 0.35

      const manualTarget = manualTargetRef.current
      if (manualTarget && manualTarget.until > Date.now()) {
        const candidates = getCandidates()
        if (candidates.length === 0) return
        const targetEl = candidates.find(el => el.dataset.section === manualTarget.id)
        if (targetEl) {
          const targetTop = getSectionTop(targetEl)
          const nearTarget = Math.abs(targetTop - focusY) <= height * 0.2
          if (!nearTarget) {
            activeSection.set(manualTarget.id)
            return
          }
          manualTargetRef.current = { id: manualTarget.id, until: Date.now() + 200 }
          activeSection.set(manualTarget.id)
          return
        }
      }

      const candidates = getCandidates()
      if (candidates.length === 0) return

      if (scrollTop <= 0) {
        activeSection.set(candidates[0]!.dataset.section as T)
        return
      }

      if (scrollTop + height >= scrollHeight - 1) {
        activeSection.set(candidates[candidates.length - 1]!.dataset.section as T)
        return
      }

      let best: { id: T; top: number } | null = null
      for (const el of candidates) {
        const top = getSectionTop(el)
        if (top <= focusY) {
          best = { id: el.dataset.section as T, top }
        } else if (!best) {
          best = { id: el.dataset.section as T, top }
        } else {
          break
        }
      }

      if (best) activeSection.set(best.id)
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateActiveSection)
    }

    const rootTarget: HTMLElement | Window = isWindowRoot ? window : scrollRoot
    rootTarget.addEventListener('scroll', scheduleUpdate, { passive: true })

    const onWheel: EventListener = event => {
      if (!(event instanceof WheelEvent)) return
      const { height } = getViewport()
      const delta = Math.abs(event.deltaY)
      if (delta <= 0) return

      const now = Date.now()
      const history = scrollSnapRef.current
      history.push({ value: delta, time: now })
      while (history.length > 0 && now - history[0]!.time > 140) history.shift()

      const totalDelta = history.reduce((sum, entry) => sum + entry.value, 0)
      const isSmallScroll = delta <= height * 0.18 && totalDelta <= height * 0.35
      if (!isSmallScroll) return

      event.preventDefault()

      const candidates = getCandidates()
      if (candidates.length === 0) return
      const current = getEffectiveActiveSection(activeSection.value)
      const ids = candidates.map(item => item.dataset.section as T)
      const currentIndex = current ? ids.indexOf(current) : -1
      const direction = event.deltaY > 0 ? 1 : -1
      const nextIndex = Math.min(
        Math.max((currentIndex === -1 ? 0 : currentIndex) + direction, 0),
        ids.length - 1
      )
      const nextId = ids[nextIndex]
      if (!nextId || nextId === current) return

      manualTargetRef.current = { id: nextId, until: Date.now() + 700 }
      activeSection.set(nextId)
      const targetEl = document.getElementById(nextId)
      targetEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    rootTarget.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', scheduleUpdate)

    scheduleUpdate()

    return () => {
      cancelAnimationFrame(rafId)
      rootTarget.removeEventListener('scroll', scheduleUpdate)
      rootTarget.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [activeSection, getEffectiveActiveSection])

  const scrollToSection = useCallback(
    (id: T) => {
      manualTargetRef.current = { id, until: Date.now() + 600 }
      activeSection.set(id)
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [activeSection]
  )

  return {
    activeSection,
    contentRef,
    getEffectiveActiveSection,
    scrollToSection,
  }
}

export function SectionedForm<T extends SectionId>({
  sections,
  defaultSection,
  dialog = false,
  children,
  className,
}: SectionedFormProps<T>) {
  const { activeSection, contentRef, getEffectiveActiveSection, scrollToSection } =
    useSectionTracker(sections, defaultSection)

  const visibleSections = sections.filter(s => s.show)
  const hiddenSections = sections.filter(s => !s.show)
  const escapeSectionId = (value: string) =>
    typeof CSS !== 'undefined' && CSS.escape
      ? CSS.escape(value)
      : value.replace(/([^\w-])/g, c => `\\${c.charCodeAt(0).toString(16)} `)
  const hiddenStyle = hiddenSections.length
    ? `${hiddenSections
        .map(section => `[data-section="${escapeSectionId(section.id)}"]`)
        .join(',')} { display: none; }`
    : ''

  function SectionButton({ item }: { item: (typeof visibleSections)[number] }) {
    const activeSectionValue = activeSection.use()
    const effectiveActive = getEffectiveActiveSection(activeSectionValue)
    const isActive = item.id === effectiveActive
    const Icon = item.Icon

    return (
      <button
        key={item.id}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        onClick={() => scrollToSection(item.id)}
        className={cn(
          'w-full text-left rounded-lg px-3 py-2 text-sm font-medium',
          'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className="size-4 shrink-0" />
          <span>{item.label}</span>
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn('grid grid-cols-[max-content_minmax(0,1fr)] gap-6 min-h-0 flex-1', className)}
    >
      {hiddenStyle ? <style>{hiddenStyle}</style> : null}
      <nav
        aria-label="Form sections"
        className={cn('flex flex-col gap-1 self-start', dialog ? 'sticky top-14' : 'sticky top-2')}
      >
        {visibleSections.map(section => (
          <SectionButton key={section.id} item={section} />
        ))}
      </nav>
      {children({ contentRef })}
    </div>
  )
}

export type FormSectionProps = {
  id: SectionId
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
}

export function FormSection({ id, title, description, children, className }: FormSectionProps) {
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        'scroll-mt-20 rounded-xl border bg-card/30 p-4',
        'supports-backdrop-filter:bg-card/20',
        className
      )}
    >
      <header className="mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? (
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        ) : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
