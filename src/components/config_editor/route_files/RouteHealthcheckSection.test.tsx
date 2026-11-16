import { afterEach, expect, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { act, useEffect } from 'react'
import type { FormStore } from 'juststore'
import type { Root } from 'react-dom/client'
import type { Routes } from '@/types/godoxy'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' })
Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
  window: dom.window,
  document: dom.window.document,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  SVGElement: dom.window.SVGElement,
  Node: dom.window.Node,
  navigator: dom.window.navigator,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0),
  cancelAnimationFrame: clearTimeout,
})
const { createRoot } = await import('react-dom/client')
const { useForm } = await import('juststore')
const { RouteHealthcheckSection } = await import('./RouteHealthcheckSection')
let root: Root
let form: FormStore<Routes.Route>

function Editor({ route }: { route: Routes.Route }) {
  const editorForm = useForm<Routes.Route>(route)
  useEffect(() => {
    form = editorForm
  }, [editorForm])
  return <RouteHealthcheckSection form={editorForm} />
}

afterEach(async () => {
  await act(async () => root.unmount())
})

for (const silence of [undefined, [], ['02:00-04:00']] as const) {
  test(`silence editor preserves inheritance and opt-out from ${JSON.stringify(silence)}`, async () => {
    document.body.innerHTML = '<div id="root"></div>'
    const container = document.getElementById('root')!
    root = createRoot(container)
    const route = {
      healthcheck: { silence: silence === undefined ? undefined : [...silence] },
    } as Routes.Route
    await act(async () => root.render(<Editor route={route} />))
    const label = Array.from(container.querySelectorAll<HTMLLabelElement>('label')).find(
      item => item.textContent === 'Use default silence windows'
    )!
    expect(label.control).not.toBeNull()
    expect(form.healthcheck.silence.value).toEqual(silence)
    if (silence === undefined) {
      await act(async () => label.click())
    } else if (silence.length) {
      const remove = container.querySelector<HTMLButtonElement>('[title="Remove from list"]')!
      await act(async () => remove.click())
    }
    expect(form.healthcheck.silence.value).toEqual([])
    expect(JSON.parse(JSON.stringify(form.value)).healthcheck.silence).toEqual([])
    await act(async () => label.click())
    expect(form.healthcheck.silence.value).toBeUndefined()
    expect(JSON.parse(JSON.stringify(form.value)).healthcheck).not.toHaveProperty('silence')
    await act(async () => label.click())
    expect(form.healthcheck.silence.value).toEqual([])
  })
}
