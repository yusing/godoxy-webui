import { afterEach, expect, mock, spyOn, test } from 'bun:test'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { FitAddon } from '@xterm/addon-fit'
import { WebFontsAddon } from '@xterm/addon-web-fonts'
import * as colors from './logs.ts'

mock.module('@/components/ThemeProvider', () => ({ useTheme: () => ({ resolvedTheme: 'dark' }) }))
mock.module('./LogProvider', () => ({ default: () => null }))
const canvas = spyOn(window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
const { Terminal } = await import('@xterm/xterm')
canvas.mockRestore()
const { default: Logs } = await import('./Logs.tsx')

afterEach(() => {
  document.body.innerHTML = ''
})

for (const outcome of ['loaded', 'rejected', 'unsupported', 'unmounted'] as const) {
  test(`terminal initialization when optional fonts are ${outcome}`, async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)
    const fontLoad = Promise.withResolvers<FontFace[]>()
    const fonts = spyOn(WebFontsAddon.prototype, 'loadFonts')
    if (outcome !== 'unsupported') fonts.mockReturnValue(fontLoad.promise)
    const foreground = spyOn(colors, 'resolveForegroundColorAsync').mockResolvedValue('#ffffff')
    const opened = spyOn(Terminal.prototype, 'open').mockImplementation(() => {})
    const disposed = spyOn(Terminal.prototype, 'dispose')
    const fit = spyOn(FitAddon.prototype, 'fit').mockImplementation(() => {})
    const originalRaf = globalThis.requestAnimationFrame
    const originalCancel = globalThis.cancelAnimationFrame
    const originalResize = globalThis.ResizeObserver
    const originalAbort = globalThis.AbortController
    globalThis.requestAnimationFrame = callback => Number(setTimeout(() => callback(0), 0))
    globalThis.cancelAnimationFrame = id => clearTimeout(id)
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    globalThis.AbortController = window.AbortController
    let mounted = true
    try {
      await act(async () => root.render(<Logs routeKey="font-test" />))
      expect(fonts).toHaveBeenCalledTimes(1)
      expect(opened).toHaveBeenCalledTimes(outcome === 'unsupported' ? 1 : 0)
      if (outcome === 'unmounted') {
        await act(async () => root.unmount())
        mounted = false
        expect(disposed).toHaveBeenCalledTimes(1)
      }
      await act(async () => {
        if (outcome === 'rejected') fontLoad.reject(new Error('font unavailable'))
        else fontLoad.resolve([])
        await fontLoad.promise.catch(() => {})
      })
      expect(opened).toHaveBeenCalledTimes(outcome === 'unmounted' ? 0 : 1)
      if (outcome !== 'unmounted') {
        const terminal = opened.mock.contexts[0]
        expect(terminal.options.fontFamily).toBe(
          outcome === 'rejected' || outcome === 'unsupported'
            ? 'monospace'
            : 'Cascadia Code Variable, monospace'
        )
      }
    } finally {
      if (mounted) await act(async () => root.unmount())
      fonts.mockRestore()
      foreground.mockRestore()
      opened.mockRestore()
      disposed.mockRestore()
      fit.mockRestore()
      globalThis.requestAnimationFrame = originalRaf
      globalThis.cancelAnimationFrame = originalCancel
      globalThis.ResizeObserver = originalResize
      globalThis.AbortController = originalAbort
    }
  })
}
