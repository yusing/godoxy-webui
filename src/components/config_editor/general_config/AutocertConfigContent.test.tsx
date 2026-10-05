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
const { FieldInput } = await import('@/components/form/FieldInput')

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
  expect(Array.from(container.querySelectorAll('label'), label => label.textContent)).toContain(
    'Api Key'
  )
  expect(Array.from(container.querySelectorAll('code'), key => key.textContent)).toContain(
    'api_key'
  )
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
  const keys = Array.from(container.querySelectorAll('code'), item => item.textContent)
  expect(keys).toContain('auth_token')
  expect(keys).not.toContain('api_key')
  expect(keys).not.toContain('api_secret')

  await act(async () => trigger.click())
  const local = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    item => item.textContent === 'local'
  )!
  await act(async () => local.click())
  expect(configStore.configObject.autocert.value).toMatchObject({
    provider: 'local',
    extra: [{ provider: 'local' }],
  })
  const localKeys = Array.from(container.querySelectorAll('code'), item => item.textContent)
  expect(localKeys).not.toContain('auth_token')
  expect(localKeys).not.toContain('email')
})

test('extra certificate provider changes replace options without changing the main provider', async () => {
  await act(async () => root.render(<AutocertConfigContent />))
  const trigger = Array.from(
    container.querySelectorAll<HTMLButtonElement>('[data-slot="select-trigger"]')
  ).find(item => item.textContent?.includes('local'))!
  await act(async () => trigger.click())
  const azure = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    item => item.textContent === 'azuredns'
  )!
  await act(async () => azure.click())
  const checkbox = container.querySelector<HTMLElement>('[data-slot="checkbox"]')!
  expect(checkbox).not.toBeNull()
  await act(async () => checkbox.click())
  expect(configStore.configObject.autocert.value).toMatchObject({
    provider: 'spaceship',
    options: { api_key: 'test-key', api_secret: 'test-secret' },
    extra: [{ provider: 'azuredns', options: { private_zone: true } }],
  })

  await act(async () => trigger.click())
  const acmedns = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    item => item.textContent === 'acmedns'
  )!
  await act(async () => acmedns.click())
  expect(configStore.configObject.autocert.value?.extra?.[0]).toMatchObject({
    provider: 'acmedns',
  })
  expect(configStore.configObject.autocert.value?.extra?.[0]?.options).toBeUndefined()
  expect(container.querySelector('[data-slot="checkbox"]')).toBeNull()
  const keys = Array.from(container.querySelectorAll('code'), item => item.textContent)
  expect(keys).toContain('allow_list')
  expect(keys).not.toContain('private_zone')
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
  expect(container.textContent).toContain('Oauth2 Config')
  expect(container.textContent).toContain('Allow List')
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

for (const value of [undefined, false, true, 'false', 'true'] as const) {
  test(`boolean provider options render as checkboxes for ${typeof value} ${String(value)}`, async () => {
    const options = value === undefined ? {} : { private_zone: value }
    configStore.configObject.autocert.set({
      provider: 'azuredns',
      email: 'admin@example.com',
      domains: ['example.com'],
      options,
      extra: [{ provider: 'azuredns', options }],
    })
    await act(async () => root.render(<AutocertConfigContent />))
    const checkboxes = container.querySelectorAll<HTMLElement>(
      '[data-slot="checkbox"][aria-label="Private Zone"]'
    )
    expect(checkboxes).toHaveLength(2)
    const checked = value === true || value === 'true'
    for (const checkbox of checkboxes) {
      expect(checkbox.getAttribute('aria-checked')).toBe(String(checked))
    }
    expect(configStore.configObject.autocert.value).toMatchObject({
      options,
      extra: [{ options }],
    })

    const labels = Array.from(container.querySelectorAll<HTMLLabelElement>('label')).filter(
      label => label.textContent === 'Private Zone'
    )
    expect(labels).toHaveLength(2)
    expect(labels[0]!.control).not.toBeNull()
    await act(async () => labels[0]!.click())
    expect(configStore.configObject.autocert.value).toMatchObject({
      options: { private_zone: !checked },
      extra: [{ options }],
    })
    await act(async () => checkboxes[1]!.click())
    expect(configStore.configObject.autocert.value).toMatchObject({
      options: { private_zone: !checked },
      extra: [{ options: { private_zone: !checked } }],
    })
    await act(async () => checkboxes[0]!.click())
    expect(configStore.configObject.autocert.value).toMatchObject({
      options: { private_zone: checked },
      extra: [{ options: { private_zone: !checked } }],
    })
  })
}

test('duration labels use field names while other descriptions remain unchanged', async () => {
  configStore.configObject.autocert.set({
    provider: 'cloudflare',
    email: 'admin@example.com',
    domains: ['example.com'],
    extra: [{ provider: 'cloudflare' }],
  })
  await act(async () => root.render(<AutocertConfigContent />))
  const labels = Array.from(container.querySelectorAll('label'), label => label.textContent)
  for (const title of ['Polling Interval', 'Propagation Timeout']) {
    expect(labels.filter(label => label === title)).toHaveLength(2)
  }
  expect(labels).toContain('ACME email*')
  expect(container.textContent).not.toContain('Go duration, for example 30s or 1m30s.')
})

test('controlled boolean fields use checkboxes and preserve readonly behavior', async () => {
  const schema = {
    properties: {
      private_zone: {
        title: 'Private zone',
        anyOf: [
          { type: 'boolean' },
          { type: 'string', const: 'true' },
          { type: 'string', const: 'false' },
        ],
      },
    },
  }
  const onChange = mock((value: unknown) => value)
  const renderField = (readonly: boolean) => (
    <FieldInput
      fieldKey="private_zone"
      fieldValue="false"
      schema={schema}
      placeholder={undefined}
      onChange={onChange}
      allowDelete={false}
      readonly={readonly}
    />
  )
  await act(async () => root.render(renderField(false)))
  const checkbox = container.querySelector<HTMLElement>('[data-slot="checkbox"]')!
  expect(checkbox.getAttribute('aria-label')).toBe('Private zone')
  expect(checkbox.getAttribute('aria-checked')).toBe('false')
  const label = container.querySelector<HTMLLabelElement>('label')!
  expect(label.control).not.toBeNull()
  await act(async () => label.click())
  expect(onChange).toHaveBeenCalledWith(true)

  onChange.mockClear()
  await act(async () => root.render(renderField(true)))
  await act(async () => checkbox.click())
  expect(onChange).not.toHaveBeenCalled()
})
