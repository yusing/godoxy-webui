import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { refreshAgentStore } from './AllSystemInfoProvider'
import { store } from './store'

const localStorageMock = {
  getItem: mock(() => null),
  setItem: mock(() => undefined),
  removeItem: mock(() => undefined),
  clear: mock(() => undefined),
}

const listMock = mock(async () => ({
  data: [
    {
      name: 'agent-1',
      addr: '10.0.0.1:8890',
      runtime: 'docker',
      version: '0.1.0',
      labels: {},
      supports_tcp_stream: true,
      supports_udp_stream: false,
    },
  ],
}))

mock.module('@/lib/api-client', () => ({
  api: {
    agent: {
      list: listMock,
    },
  },
}))

describe('refreshAgentStore', () => {
  const originalWindow = globalThis.window
  const location = { hash: '#missing-agent' }

  beforeEach(() => {
    globalThis.localStorage = localStorageMock as Storage
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
    listMock.mockClear()
    store.agents.set({})
    globalThis.window = { location } as Window & typeof globalThis
    location.hash = '#missing-agent'
  })

  afterEach(() => {
    globalThis.window = originalWindow
  })

  test('refreshes agent store and clears stale fragment selection', async () => {
    await refreshAgentStore('missing-agent')

    expect(listMock).toHaveBeenCalledTimes(1)
    expect(store.agents.value).toMatchObject({
      'agent-1': expect.objectContaining({ name: 'agent-1' }),
    })
    expect(location.hash).toBe('')
  })
})
