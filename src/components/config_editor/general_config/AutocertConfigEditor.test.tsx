import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { fireEvent } from '@testing-library/dom'
import type { Root } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import { parse as parseYAML } from 'yaml'
import { api } from '@/lib/api-client'
import type { Autocert, Config } from '@/types/godoxy'

mock.module('@tanstack/react-router', () => ({
  useBlocker: mock(() => undefined),
}))

const fileGetMock = mock(
  async (..._args: Parameters<typeof api.file.get>) =>
    ({
      data: '',
    }) as Awaited<ReturnType<typeof api.file.get>>
)
const fileValidateMock = mock(
  async (..._args: Parameters<typeof api.file.validate>) =>
    ({
      data: { message: 'ok' },
    }) as Awaited<ReturnType<typeof api.file.validate>>
)
const fileSetMock = mock(
  async (..._args: Parameters<typeof api.file.set>) =>
    ({
      data: { message: 'ok' },
    }) as Awaited<ReturnType<typeof api.file.set>>
)
const certInfoMock = mock(() => new Promise<never>(() => {}))
const certProvidersMock = mock(async () => ({
  data: ['cloudflare', 'digitalocean', 'ovh', 'spaceship', 'runtime-provider-from-existing-config'],
}))

api.file.get = fileGetMock as typeof api.file.get
api.file.validate = fileValidateMock as typeof api.file.validate
api.file.set = fileSetMock as typeof api.file.set
api.cert.info = certInfoMock as typeof api.cert.info
api.cert.providers = certProvidersMock as unknown as typeof api.cert.providers

const { configStore } = await import('../store')

let act: typeof import('react').act
let createRoot: typeof import('react-dom/client').createRoot
let ConfigStateSyncronizer: typeof import('../ConfigStateSyncronizer').default
let ConfigSaveButton: typeof import('../ConfigSaveButton').default
let AutocertConfigContent: typeof import('./AutocertConfigContent').default

type ParsedConfig = {
  autocert: {
    provider?: string
    email?: string
    domains?: string[]
    cert_path?: string
    key_path?: string
    resolvers?: string[]
    certificate_key_type?: string
    acme_key_path?: string
    ca_dir_url?: string
    ca_certs?: string[]
    eab_kid?: string
    eab_hmac?: string
    options?: Record<string, string>
    extra?: Array<{
      provider?: string
      email?: string
      domains?: string[]
      cert_path?: string
      key_path?: string
      options?: Record<string, string>
    }>
  }
}

const spaceshipConfig = `autocert:
  provider: spaceship
  email: editor-repro@example.test
  domains:
    - example.test
  cert_path: certs/main.crt
  key_path: certs/main.key
  resolvers:
    - 9.9.9.9:53
  acme_key_path: certs/acme-main.key
  certificate_key_type: RSA4096
  eab_kid: sanitized-main-eab-id
  eab_hmac: sanitized-main-eab-hmac
  ca_certs:
    - certs/main-ca.pem
  options:
    api_key: sanitized-main-api-key
    api_secret: sanitized-main-api-secret
  extra:
    - provider: spaceship
      email: extra-repro@example.test
      domains:
        - extra.example.test
      cert_path: certs/extra.crt
      key_path: certs/extra.key
      certificate_key_type: RSA2048
      options:
        api_key: sanitized-extra-api-key
        api_secret: sanitized-extra-api-secret
    - email: inherited-repro@example.test
      domains:
        - inherited.example.test
      cert_path: certs/inherited.crt
      key_path: certs/inherited.key
`

const noOptionsConfig = `autocert:
  provider: spaceship
  email: env-provider@example.test
  domains:
    - env-provider.example.test
`

const unlistedProviderConfig = `autocert:
  provider: external-runtime-dns
  email: unknown-provider@example.test
  domains:
    - unknown-provider.example.test
  options:
    api_key: sanitized-unknown-api-key
`

const cloudflareConfig = `autocert:
  provider: cloudflare
  email: cloudflare-repro@example.test
  domains:
    - cloudflare.example.test
  options:
    auth_token: sanitized-cloudflare-token
`

const ovhConfig = `autocert:
  provider: ovh
  email: ovh-repro@example.test
  domains:
    - ovh.example.test
  options:
    application_key: sanitized-ovh-application-key
    application_secret: sanitized-ovh-application-secret
    consumer_key: sanitized-ovh-consumer-key
    api_endpoint: ovh-eu
`

const providerSelectionConfig = `autocert:
  provider: spaceship
  email: selection-repro@example.test
  domains:
    - selection.example.test
  cert_path: certs/selection.crt
  key_path: certs/selection.key
  resolvers:
    - 8.8.8.8:53
  acme_key_path: certs/selection-acme.key
  ca_dir_url: https://ca.example.test/acme/directory
  ca_certs:
    - certs/selection-ca.pem
  eab_kid: sanitized-selection-eab-id
  eab_hmac: sanitized-selection-eab-hmac
  certificate_key_type: RSA3072
  options:
    api_key: sanitized-selection-api-key
    api_secret: sanitized-selection-api-secret
  extra:
    - provider: spaceship
      email: extra-selection@example.test
      domains:
        - extra-selection.example.test
      options:
        api_key: sanitized-extra-selection-api-key
        api_secret: sanitized-extra-selection-api-secret
    - email: inherited-selection@example.test
      domains:
        - inherited-selection.example.test
`

describe('autocert editor fetch, search, validation, and save', () => {
  let dom: JSDOM
  let container: HTMLDivElement
  let root: Root
  let responseText: string

  beforeEach(async () => {
    dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
    Object.defineProperties(globalThis, {
      window: { configurable: true, value: dom.window },
      document: { configurable: true, value: dom.window.document },
      navigator: { configurable: true, value: dom.window.navigator },
      localStorage: { configurable: true, value: dom.window.localStorage },
      HTMLElement: { configurable: true, value: dom.window.HTMLElement },
      Element: { configurable: true, value: dom.window.Element },
      SVGElement: { configurable: true, value: dom.window.SVGElement },
      Node: { configurable: true, value: dom.window.Node },
      NodeFilter: { configurable: true, value: dom.window.NodeFilter },
      MutationObserver: { configurable: true, value: dom.window.MutationObserver },
      getComputedStyle: { configurable: true, value: dom.window.getComputedStyle },
      requestAnimationFrame: {
        configurable: true,
        value: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0),
      },
      cancelAnimationFrame: {
        configurable: true,
        value: (handle: ReturnType<typeof setTimeout>) => clearTimeout(handle),
      },
      IS_REACT_ACT_ENVIRONMENT: { configurable: true, value: true },
    })
    Object.defineProperty(dom.window, 'requestAnimationFrame', {
      configurable: true,
      value: globalThis.requestAnimationFrame,
    })
    Object.defineProperty(dom.window, 'cancelAnimationFrame', {
      configurable: true,
      value: globalThis.cancelAnimationFrame,
    })
    const [react, reactDOM] = await Promise.all([import('react'), import('react-dom/client')])
    act = react.act
    createRoot = reactDOM.createRoot

    responseText = spaceshipConfig
    fileGetMock.mockClear()
    fileValidateMock.mockClear()
    fileSetMock.mockClear()
    certInfoMock.mockClear()
    fileGetMock.mockImplementation(async () => ({ data: responseText }) as never)
    fileValidateMock.mockImplementation(async () => ({ data: { message: 'ok' } }) as never)
    fileSetMock.mockImplementation(async () => ({ data: { message: 'ok' } }) as never)
    certProvidersMock.mockImplementation(
      async () =>
        ({
          data: [
            'cloudflare',
            'digitalocean',
            'ovh',
            'spaceship',
            'runtime-provider-from-existing-config',
          ],
        }) as never
    )

    configStore.activeFile.set({ type: 'config', filename: 'config.yml' })
    configStore.files.set({
      config: [{ type: 'config', filename: 'config.yml' }],
      provider: [],
      middleware: [],
    })
    configStore.content.set('')
    configStore.configObject.reset()
    configStore.originalConfig.reset()
    configStore.error.reset()
    configStore.validateError.reset()

    container = dom.window.document.createElement('div')
    dom.window.document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    dom.window.close()
  })

  async function mountEditor() {
    await loadEditorComponents()
    await act(async () => {
      root.render(
        <>
          <ConfigStateSyncronizer />
          <AutocertConfigContent />
          <ConfigSaveButton data-testid="save-config" />
        </>
      )
    })
    await waitUntil(() => configStore.originalConfig.value?.autocert !== undefined, 'loaded config')
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
  }

  async function saveCurrentConfig() {
    const button = container.querySelector<HTMLButtonElement>('[data-testid="save-config"]')
    expect(button).not.toBeNull()
    await act(async () => {
      button?.click()
    })
    expect(fileSetMock).toHaveBeenCalledTimes(1)
    return parseYAML(fileSetMock.mock.calls[0]?.[1] ?? '') as ParsedConfig
  }

  test('keeps a configured provider through catalog failure and retries on remount', async () => {
    const configuredProvider = 'runtime-provider-from-existing-config'
    let rejectProviders!: (error: Error) => void
    const pendingRequest = new Promise<Awaited<ReturnType<typeof api.cert.providers>>>(
      (_resolve, reject) => {
        rejectProviders = reject
      }
    )
    certProvidersMock.mockImplementation(() => pendingRequest)
    configStore.configObject.set({
      autocert: {
        provider: configuredProvider,
        email: 'existing-config@example.test',
        domains: ['existing-config.example.test'],
      },
    } as unknown as Config.Config)
    await loadEditorComponents()
    await act(async () => root.render(<AutocertConfigContent />))
    await waitUntil(() => certProvidersMock.mock.calls.length === 1, 'first provider request')

    const selectedInput = () =>
      [...container.querySelectorAll<HTMLInputElement>('input')].find(
        input => input.value === configuredProvider
      )
    expect(selectedInput()).toBeDefined()

    await act(async () => {
      rejectProviders(new Error('catalog unavailable'))
      await pendingRequest.catch(() => undefined)
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(configStore.configObject.value?.autocert?.provider).toBe(configuredProvider)
    expect(selectedInput()).toBeDefined()

    await act(async () => root.unmount())
    certProvidersMock.mockImplementation(
      async () =>
        ({
          data: ['cloudflare', 'digitalocean', 'ovh', 'spaceship', configuredProvider],
        }) as never
    )
    root = createRoot(container)
    await act(async () => root.render(<AutocertConfigContent />))
    await waitUntil(() => certProvidersMock.mock.calls.length === 2, 'retry provider request')
    expect(configStore.configObject.value?.autocert?.provider).toBe(configuredProvider)
    expect(selectedInput()).toBeDefined()
  })

  test('keeps main and extra provider data through fetch, an unrelated edit, validation, and save', async () => {
    await mountEditor()

    await act(async () => {
      const current = configStore.configObject.autocert.value
      configStore.configObject.autocert.set({
        ...current,
        email: 'edited-repro@example.test',
      } as Autocert.AutocertConfig)
    })
    await waitUntil(
      () => configStore.content.value?.includes('edited-repro@example.test') === true,
      'unrelated edit serialization'
    )

    const validated = parseYAML(fileValidateMock.mock.calls.at(-1)?.[1] ?? '') as ParsedConfig
    expect(validated.autocert.provider).toBe('spaceship')
    expect(validated.autocert.ca_dir_url).toBeUndefined()

    const saved = await saveCurrentConfig()
    expect(saved.autocert).toMatchObject({
      provider: 'spaceship',
      email: 'edited-repro@example.test',
      domains: ['example.test'],
      cert_path: 'certs/main.crt',
      key_path: 'certs/main.key',
      resolvers: ['9.9.9.9:53'],
      acme_key_path: 'certs/acme-main.key',
      certificate_key_type: 'RSA4096',
      eab_kid: 'sanitized-main-eab-id',
      eab_hmac: 'sanitized-main-eab-hmac',
      ca_certs: ['certs/main-ca.pem'],
      options: {
        api_key: 'sanitized-main-api-key',
        api_secret: 'sanitized-main-api-secret',
      },
    })
    expect(saved.autocert.ca_dir_url).toBeUndefined()
    expect(saved.autocert.extra?.[0]).toMatchObject({
      provider: 'spaceship',
      email: 'extra-repro@example.test',
      domains: ['extra.example.test'],
      cert_path: 'certs/extra.crt',
      key_path: 'certs/extra.key',
      certificate_key_type: 'RSA2048',
      options: {
        api_key: 'sanitized-extra-api-key',
        api_secret: 'sanitized-extra-api-secret',
      },
    })
    expect(saved.autocert.extra?.[1]).toMatchObject({
      email: 'inherited-repro@example.test',
      domains: ['inherited.example.test'],
      cert_path: 'certs/inherited.crt',
      key_path: 'certs/inherited.key',
    })
    expect(saved.autocert.extra?.[1]).not.toHaveProperty('provider')
  })

  test('preserves omitted options without inventing credentials', async () => {
    responseText = noOptionsConfig
    await mountEditor()

    const saved = await saveCurrentConfig()
    expect(saved.autocert.provider).toBe('spaceship')
    expect(saved.autocert.options).toBeUndefined()
    expect(saved.autocert.ca_dir_url).toBeUndefined()
  })

  test('retains a configured provider string missing from the fetched catalog', async () => {
    responseText = unlistedProviderConfig
    await mountEditor()

    const saved = await saveCurrentConfig()
    expect(saved.autocert.provider).toBe('external-runtime-dns')
    expect(saved.autocert.options).toEqual({ api_key: 'sanitized-unknown-api-key' })
  })

  test('searches the fetched catalog and saves the selected provider without losing shared settings', async () => {
    responseText = providerSelectionConfig
    await mountEditor()

    const pickers = [
      ...container.querySelectorAll<HTMLButtonElement>(
        'button[role="combobox"][aria-haspopup="dialog"]'
      ),
    ]
    expect(pickers.length).toBe(3)
    const inheritedProviderInputs = [
      ...container.querySelectorAll<HTMLInputElement>('input[aria-hidden="true"]'),
    ].filter(input => input.value === 'spaceship')
    expect(inheritedProviderInputs.length).toBe(3)

    await act(async () => {
      fireEvent.click(pickers[0]!)
    })
    await waitUntil(
      () =>
        dom.window.document.querySelector('input[role="combobox"][aria-autocomplete="list"]') !==
        null,
      'provider search input'
    )
    const searchInput = dom.window.document.querySelector<HTMLInputElement>(
      'input[role="combobox"][aria-autocomplete="list"]'
    )!
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'digitalocean' } })
    })
    await waitUntil(() => {
      const options = [...dom.window.document.querySelectorAll('[role="option"]')]
      return options.length === 1 && options[0]?.textContent?.trim() === 'digitalocean'
    }, 'filtered backend-listed provider')
    const option = dom.window.document.querySelector('[role="option"]')!
    await act(async () => {
      fireEvent.click(option)
    })
    expect(configStore.configObject.value?.autocert?.provider).toBe('digitalocean')
    const providerInputsAfterChange = [
      ...container.querySelectorAll<HTMLInputElement>('input[aria-hidden="true"]'),
    ]
      .map(input => input.value)
      .filter(value => value === 'digitalocean' || value === 'spaceship')
    expect(providerInputsAfterChange).toEqual(['digitalocean', 'spaceship', 'digitalocean'])
    await waitUntil(
      () => configStore.content.value?.includes('provider: digitalocean') === true,
      'selected provider serialization'
    )

    const saved = await saveCurrentConfig()
    expect(saved.autocert.provider).toBe('digitalocean')
    expect(saved.autocert.options).toBeUndefined()
    expect(saved.autocert.email).toBe('selection-repro@example.test')
    expect(saved.autocert.domains).toEqual(['selection.example.test'])
    expect(saved.autocert.cert_path).toBe('certs/selection.crt')
    expect(saved.autocert.key_path).toBe('certs/selection.key')
    expect(saved.autocert.resolvers).toEqual(['8.8.8.8:53'])
    expect(saved.autocert.acme_key_path).toBe('certs/selection-acme.key')
    expect(saved.autocert.ca_dir_url).toBe('https://ca.example.test/acme/directory')
    expect(saved.autocert.ca_certs).toEqual(['certs/selection-ca.pem'])
    expect(saved.autocert.eab_kid).toBe('sanitized-selection-eab-id')
    expect(saved.autocert.eab_hmac).toBe('sanitized-selection-eab-hmac')
    expect(saved.autocert.certificate_key_type).toBe('RSA3072')
    expect(saved.autocert.extra?.[0]).toMatchObject({
      provider: 'spaceship',
      email: 'extra-selection@example.test',
      options: {
        api_key: 'sanitized-extra-selection-api-key',
        api_secret: 'sanitized-extra-selection-api-secret',
      },
    })
    expect(saved.autocert.extra?.[1]).not.toHaveProperty('provider')
  })

  test('renders and saves the native Cloudflare provider form', async () => {
    responseText = cloudflareConfig
    await mountEditor()

    expect(
      [...container.querySelectorAll('input')].some(
        input => input.value === 'sanitized-cloudflare-token'
      )
    ).toBe(true)

    const saved = await saveCurrentConfig()
    expect(saved.autocert.provider).toBe('cloudflare')
    expect(saved.autocert.options).toEqual({ auth_token: 'sanitized-cloudflare-token' })
  })

  test('renders and saves the native OVH application-key form', async () => {
    responseText = ovhConfig
    await mountEditor()

    const inputValues = [...container.querySelectorAll('input')].map(input => input.value)
    expect(inputValues).toContain('sanitized-ovh-application-key')
    expect(inputValues).toContain('sanitized-ovh-application-secret')
    expect(inputValues).toContain('sanitized-ovh-consumer-key')

    const saved = await saveCurrentConfig()
    expect(saved.autocert.provider).toBe('ovh')
    expect(saved.autocert.options).toEqual({
      application_key: 'sanitized-ovh-application-key',
      application_secret: 'sanitized-ovh-application-secret',
      consumer_key: 'sanitized-ovh-consumer-key',
      api_endpoint: 'ovh-eu',
    })
  })
})

async function loadEditorComponents() {
  ;[ConfigStateSyncronizer, ConfigSaveButton, AutocertConfigContent] = await Promise.all([
    import('../ConfigStateSyncronizer').then(module => module.default),
    import('../ConfigSaveButton').then(module => module.default),
    import('./AutocertConfigContent').then(module => module.default),
  ])
}

async function waitUntil(predicate: () => boolean, label = 'condition') {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (predicate()) return
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
  }
  throw new Error(
    `Timed out waiting for ${label}; get=${fileGetMock.mock.calls.length}, ` +
      `providers=${certProvidersMock.mock.calls.length}, ` +
      `original=${JSON.stringify(configStore.originalConfig.value)}, ` +
      `content=${JSON.stringify(configStore.content.value)}`
  )
}
