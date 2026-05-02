import { useEffect } from 'react'
import { useFragment } from '@/hooks/fragment'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Agent, SystemInfo } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { store } from './store'

export function applyAgentStore(agents: Agent[], selectedAgent?: string) {
  if (
    selectedAgent &&
    typeof window !== 'undefined' &&
    !agents.some(agent => agent.name === selectedAgent)
  ) {
    window.location.hash = ''
  }

  store.agents.set(
    agents.reduce(
      (acc, agent) => {
        acc[agent.name] = agent
        return acc
      },
      {} as Record<string, Agent>
    )
  )
}

export async function refreshAgentStore(selectedAgent?: string) {
  const agents = await api.agent.list().then(res => res.data)
  applyAgentStore(agents, selectedAgent)
}

export default function AllSystemInfoProvider() {
  const agent = useFragment()

  useWebSocketApi<Record<string, SystemInfo>>({
    endpoint: '/metrics/all_system_info',
    query: {
      interval: '3s',
    },
    onMessage: data => {
      // server sends one agent at a time, so we need to set each one individually
      for (const agentName in data) {
        store.systemInfo[agentName]?.set(data[agentName]!)
      }
      store.readyState.set(true)
    },
    onError: () => store.readyState.set(false),
    onClose: () => store.readyState.set(false),
  })

  useEffect(() => {
    refreshAgentStore(agent).catch(toastError)
  }, [agent])
  return null
}
