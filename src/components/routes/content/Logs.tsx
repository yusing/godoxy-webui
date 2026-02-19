import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react'
import { FitAddon } from '@xterm/addon-fit'
import { WebFontsAddon } from '@xterm/addon-web-fonts'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal } from '@xterm/xterm'
import { Suspense, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import type { RouteKey } from '../store'

import '@xterm/xterm/css/xterm.css'

import { type Atom, createAtom } from 'juststore'
import LogProvider from './LogProvider'
import { resolveForegroundColorAsync } from './logs'

const fontFamily = 'Cascadia Code Variable'

export default function Logs({ routeKey }: { routeKey: RouteKey }) {
  const logsRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const setScrollDirectionRef = useRef<((next: 'up' | 'down') => void) | null>(null)
  const maximizedAtom = createAtom(useId(), false)

  useLayoutEffect(() => {
    const container = logsRef.current
    if (!container) return

    // Ensure we're starting from a clean DOM node.
    container.innerHTML = ''

    let cancelled = false
    let raf: number | null = null
    let resizeObserver: ResizeObserver | null = null

    const updateScrollDirection = () => {
      const term = termRef.current
      if (!term) return
      // Check if we're in the bottom half of the buffer
      const totalLines = term.buffer.active.length
      const viewportLines = term.rows
      const scrollOffset = term.buffer.active.viewportY
      // viewportY is the offset from the top of the buffer
      // If we're past the midpoint, show up arrow
      const maxScroll = Math.max(0, totalLines - viewportLines)
      const next = scrollOffset >= maxScroll / 2 ? 'up' : 'down'
      setScrollDirectionRef.current?.(next)
    }

    const cleanup = () => {
      cancelled = true
      if (raf != null) cancelAnimationFrame(raf)
      resizeObserver?.disconnect()
      fitAddonRef.current = null
      termRef.current?.dispose()
      termRef.current = null
    }

    const scheduleFit = () => {
      if (raf != null) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        if (cancelled) return
        try {
          fitAddonRef.current?.fit()
        } catch {
          // FitAddon throws when container isn't measurable (e.g. hidden).
        }
      })
    }

    const init = async () => {
      // xterm.js renders to canvas and cannot resolve CSS variables directly.
      // We must compute the actual color value at runtime.
      // Use async resolution to ensure CSS variables are ready.

      const foreground = await resolveForegroundColorAsync()
      if (cancelled) return

      const term = new Terminal({
        convertEol: true,
        disableStdin: true,
        scrollback: 5000,
        allowTransparency: true,
        fontFamily: fontFamily,
        fontSize: 12,
        fontWeight: '500',
        fontWeightBold: '700',
        lineHeight: 1.2,
        theme: {
          background: '#00000000',
          foreground,
        },
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      const webLinksAddon = new WebLinksAddon()
      term.loadAddon(webLinksAddon)

      // Use the official xterm web fonts addon to ensure fonts are loaded
      // before xterm measures character widths. This prevents spacing artifacts.
      const webFontsAddon = new WebFontsAddon()
      term.loadAddon(webFontsAddon)

      // Wait for fonts to be fully loaded before opening the terminal
      await webFontsAddon.loadFonts([fontFamily])
      if (cancelled) return

      term.open(container)

      termRef.current = term
      fitAddonRef.current = fitAddon

      resizeObserver = new ResizeObserver(() => scheduleFit())
      resizeObserver.observe(container)

      // Listen for scroll events using xterm's onScroll event
      term.onScroll(() => updateScrollDirection())
      updateScrollDirection()

      scheduleFit()
    }

    void init()

    return () => cleanup()
  }, [])

  useEffect(() => {
    const term = termRef.current
    if (term) {
      term.reset()
      term.clear()
    }
  })

  useEffect(() => {
    const unsubscribe = maximizedAtom.subscribe(maximized => {
      const log = logsRef.current
      if (log) {
        log.setAttribute('data-maximized', maximized.toString())
      }
    })
    return unsubscribe
  })

  return (
    <>
      <Suspense>
        <LogProvider key={routeKey} routeKey={routeKey} termRef={termRef} />
      </Suspense>
      <LogsInner
        maximizedAtom={maximizedAtom}
        logsRef={logsRef}
        termRef={termRef}
        setScrollDirectionRef={setScrollDirectionRef}
      />
    </>
  )
}

function LogsInner({
  maximizedAtom,
  logsRef,
  termRef,
  setScrollDirectionRef,
}: {
  maximizedAtom: Atom<boolean>
  logsRef: React.RefObject<HTMLDivElement | null>
  termRef: React.RefObject<Terminal | null>
  setScrollDirectionRef: React.RefObject<((next: 'up' | 'down') => void) | null>
}) {
  'use memo'

  const inlineHostRef = useRef<HTMLDivElement>(null)
  const portalNodeRef = useRef<HTMLDivElement | null>(
    typeof document === 'undefined' ? null : document.createElement('div')
  )
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [maximized, setMaximized] = useState(maximizedAtom.value)

  useEffect(() => {
    setScrollDirectionRef.current = next =>
      setScrollDirection(prev => (prev === next ? prev : next))
  }, [setScrollDirectionRef])

  useEffect(() => {
    const unsubscribe = maximizedAtom.subscribe(setMaximized)
    return unsubscribe
  }, [maximizedAtom])

  useLayoutEffect(() => {
    const portalNode = portalNodeRef.current
    if (!portalNode) return

    const host = maximized ? document.body : inlineHostRef.current
    if (!host) return

    host.appendChild(portalNode)

    return () => {
      if (portalNode.parentNode === host) {
        host.removeChild(portalNode)
      }
    }
  }, [maximized])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return

      // Prevent Enter from triggering fullscreen when typing in input fields
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      maximizedAtom.set(!maximizedAtom.value)
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [maximizedAtom])

  const content = (
    <div
      data-maximized={maximized ? 'true' : undefined}
      className={
        maximized
          ? 'fixed inset-0 z-50 h-screen w-screen px-[5vw] py-[5vh] bg-background/20 backdrop-blur-sm'
          : 'relative h-full w-full'
      }
    >
      <Suspense>
        <LogThemeUpdater termRef={termRef} />
      </Suspense>
      <div
        className={`routes-logs-shell rounded-xl tracking-normal p-2 relative ${maximized ? 'h-full' : 'h-[45vh]'}`}
      >
        <div ref={logsRef} className="routes-logs-terminal h-full w-full" />
        <div className="absolute top-4 right-6">
          <Button
            size="icon"
            variant="ghost"
            className="routes-logs-action"
            aria-label={maximized ? 'Minimize logs' : 'Maximize logs'}
            onClick={() => maximizedAtom.set(!maximized)}
          >
            {maximized ? <IconArrowsMinimize /> : <IconArrowsMaximize />}
          </Button>
        </div>
        <div className="absolute bottom-4 right-6">
          <Button
            size="icon"
            className="routes-logs-scroll-button"
            aria-label={scrollDirection === 'up' ? 'Scroll to top' : 'Scroll to bottom'}
            onClick={() => {
              const term = termRef.current
              if (!term) return

              if (scrollDirection === 'up') {
                term.scrollToTop()
              } else {
                term.scrollToBottom()
              }
            }}
          >
            <LogChevron direction={scrollDirection} />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div ref={inlineHostRef} className="relative h-full w-full">
      {portalNodeRef.current ? createPortal(content, portalNodeRef.current) : content}
    </div>
  )
}

function LogChevron({ direction }: { direction: 'up' | 'down' }) {
  return direction === 'up' ? <IconChevronUp /> : <IconChevronDown />
}

function LogThemeUpdater({ termRef }: { termRef: React.RefObject<Terminal | null> }) {
  const { resolvedTheme } = useTheme()
  const prevThemeRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (resolvedTheme === prevThemeRef.current) return
    prevThemeRef.current = resolvedTheme

    const term = termRef.current
    if (!term) return

    let cancelled = false

    const updateTheme = async () => {
      const foreground = await resolveForegroundColorAsync()
      if (cancelled || termRef.current !== term) return
      term.options.theme = {
        foreground,
        background: '#00000000',
      }
    }

    updateTheme()

    return () => {
      cancelled = true
    }
  }, [resolvedTheme, termRef])

  return null
}
