import { afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { JSDOM } from 'jsdom'
import { act } from 'react'
import type { Root } from 'react-dom/client'

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
  localStorage: dom.window.localStorage,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0),
  cancelAnimationFrame: clearTimeout,
})

// Certificate status is independent of the schema-backed configuration form.
mock.module('./AutocertInfo', () => ({ default: () => null }))

const { createRoot } = await import('react-dom/client')
const { default: AutocertConfigContent } = await import('./AutocertConfigContent')
const { configStore } = await import('../store')
const { AutocertSchema, ConfigSchema } = await import('@/types/godoxy')
const { getAllowedValues } = await import('@/types/schema')

let root: Root
let container: HTMLDivElement

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
  container = document.getElementById('root') as HTMLDivElement
  root = createRoot(container)
  configStore.configObject.set({
    providers: {},
    autocert: {
      provider: 'spaceship',
      email: 'admin@example.com',
      domains: ['example.com'],
      options: { api_key: 'test-key', api_secret: 'test-secret' },
      extra: [{ provider: 'local' }],
    },
  })
})

afterEach(async () => {
  await act(async () => root.unmount())
})

test('primary and extra certificates use the complete finite provider schema', async () => {
  const providers = getAllowedValues(
    AutocertSchema.definitions.AutocertConfigWithoutExtra,
    'provider'
  )!
  expect(providers).toContain('spaceship')
  expect(providers).toContain('rfc2136')
  expect(providers).toContain('custom')
  expect(providers).toContain('local')
  expect(providers).not.toContain('pseudo')
  expect(providers).not.toContain('route53')
  expect(getAllowedValues(ConfigSchema.definitions.AutocertExtra, 'provider')?.toSorted()).toEqual(
    providers.toSorted()
  )

  await act(async () => root.render(<AutocertConfigContent />))
  const triggers = container.querySelectorAll<HTMLButtonElement>('[data-slot="select-trigger"]')
  expect(triggers[0]?.textContent).toContain('spaceship')
  await act(async () => triggers[0]!.click())
  const options = Array.from(document.querySelectorAll('[role="option"]'), item => item.textContent)
  expect(options.toSorted()).toEqual(providers.toSorted())
  await act(async () => triggers[0]!.click())
  const extraTrigger = Array.from(triggers).find(trigger => trigger.textContent?.includes('local'))!
  expect(extraTrigger).toBeDefined()
  await act(async () => extraTrigger.click())
  const extraOptions = Array.from(
    document.querySelectorAll('[data-slot="select-content"][data-open] [role="option"]'),
    item => item.textContent
  )
  expect(extraOptions.toSorted()).toEqual(providers.toSorted())
})

test('concrete DNS provider credentials render and edits reach configuration state', async () => {
  await act(async () => root.render(<AutocertConfigContent />))
  const input = Array.from(container.querySelectorAll<HTMLInputElement>('input')).find(
    item => item.value === 'test-key'
  )
  expect(input).toBeDefined()
  await act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(
      dom.window.HTMLInputElement.prototype,
      'value'
    )!.set!
    setValue.call(input, 'updated-key')
    input!.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
  expect(configStore.configObject.autocert.value).toMatchObject({
    provider: 'spaceship',
    options: { api_key: 'updated-key', api_secret: 'test-secret' },
    extra: [{ provider: 'local' }],
  })
})

test('changing the main provider keeps extra certificates and clears old DNS credentials', async () => {
  await act(async () => root.render(<AutocertConfigContent />))
  const trigger = container.querySelector<HTMLButtonElement>('[data-slot="select-trigger"]')!
  await act(async () => trigger.click())
  const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    item => item.textContent === 'digitalocean'
  )!
  await act(async () => option.click())
  expect(configStore.configObject.autocert.value).toMatchObject({
    provider: 'digitalocean',
    email: 'admin@example.com',
    domains: ['example.com'],
    extra: [{ provider: 'local' }],
  })
  expect(configStore.configObject.autocert.value?.options).toBeUndefined()
})

test('nested credentials and array options render for main and extra providers', async () => {
  configStore.configObject.autocert.set({
    provider: 'ovh',
    email: 'admin@example.com',
    domains: ['example.com'],
    options: {
      oauth2_config: { client_id: 'ovh-client-id', client_secret: 'ovh-client-secret' },
      ttl: 120,
      propagation_timeout: '1m30s',
    },
    extra: [{ provider: 'acmedns', options: { allow_list: ['192.0.2.1', '198.51.100.1'] } }],
  })
  await act(async () => root.render(<AutocertConfigContent />))
  for (const key of ['oauth2_config', 'allow_list']) {
    const trigger = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-slot="collapsible-trigger"]')
    ).find(item => item.textContent?.includes(key))!
    expect(trigger).toBeDefined()
    await act(async () => trigger.click())
  }
  const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('input'))
  expect(inputs.map(input => input.value)).toEqual(
    expect.arrayContaining([
      'ovh-client-id',
      'ovh-client-secret',
      '120',
      '1m30s',
      '192.0.2.1',
      '198.51.100.1',
    ])
  )
  const input = inputs.find(item => item.value === 'ovh-client-secret')!
  await act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(
      dom.window.HTMLInputElement.prototype,
      'value'
    )!.set!
    setValue.call(input, 'updated-secret')
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
  expect(configStore.configObject.autocert.value).toMatchObject({
    provider: 'ovh',
    options: {
      oauth2_config: { client_id: 'ovh-client-id', client_secret: 'updated-secret' },
      ttl: 120,
      propagation_timeout: '1m30s',
    },
    extra: [{ provider: 'acmedns', options: { allow_list: ['192.0.2.1', '198.51.100.1'] } }],
  })
})
