import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { Agent } from '@/lib/api'
import { verifyAndStoreAgent } from './NewAgentButton'
import { store } from './store'

const localStorageMock = {
  getItem: mock(() => null),
  setItem: mock(() => undefined),
  removeItem: mock(() => undefined),
  clear: mock(() => undefined),
}

const returnedAgents: Agent[] = [
  {
    name: 'agent-1',
    addr: '10.0.0.1:8890',
    runtime: 'docker',
    version: '0.1.0',
    supports_tcp_stream: true,
    supports_udp_stream: false,
  },
  {
    name: 'agent-2',
    addr: '10.0.0.2:8890',
    runtime: 'podman',
    version: '0.2.0',
    supports_tcp_stream: true,
    supports_udp_stream: true,
  },
]

const verifyMock = mock(async (request: unknown) => ({
  data: {
    message: 'Added 2 routes',
    agents: returnedAgents,
  },
  request,
}))

mock.module('@/lib/api-client', () => ({
  api: {
    agent: {
      verify: verifyMock,
    },
  },
}))

describe('verifyAndStoreAgent', () => {
  beforeEach(() => {
    globalThis.localStorage = localStorageMock as Storage
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
    verifyMock.mockClear()
    store.agentList.set([])
    store.agents.set({})
  })

  test('includes add_to_config, avoids file calls and refetch, and updates the store from the verify response', async () => {
    const response = await verifyAndStoreAgent({
      request: {
        host: '10.0.0.1',
        port: 8890,
        container_runtime: 'docker',
      },
      agent: {
        compose: 'services: {}',
        ca: { cert: 'ca-cert', key: 'ca-key' },
        client: { cert: 'client-cert', key: 'client-key' },
      },
      addToConfig: true,
    })

    expect(verifyMock).toHaveBeenCalledTimes(1)
    expect(verifyMock).toHaveBeenCalledWith({
      host: '10.0.0.1:8890',
      ca: { cert: 'ca-cert', key: 'ca-key' },
      client: { cert: 'client-cert', key: 'client-key' },
      container_runtime: 'docker',
      add_to_config: true,
    })
    expect(store.agentList.value).toEqual(['agent-1', 'agent-2'])
    expect(store.agents.value).toMatchObject({
      'agent-1': expect.objectContaining({ addr: '10.0.0.1:8890' }),
      'agent-2': expect.objectContaining({ addr: '10.0.0.2:8890' }),
    })
    expect(response.message).toBe('Added 2 routes')
  })
})
