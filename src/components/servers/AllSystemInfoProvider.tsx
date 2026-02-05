import { useFragment } from '@/hooks/fragment'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Agent, SystemInfo } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { useEffect } from 'react'
import { store } from './store'

export default function AllSystemInfoProvider() {
  const agent = useFragment()

  useWebSocketApi<Record<string, SystemInfo>>({
    endpoint: '/metrics/all_system_info',
    onMessage: data => {
      // server sends one agent at a time, so we need to set each one individually
      for (const agent in data) {
        store.systemInfo[agent]?.set(data[agent]!)
      }
      store.readyState.set(true)
    },
    onError: () => store.readyState.set(false),
    onClose: () => store.readyState.set(false),
  })

  useEffect(() => {
    api.agent
      .list()
      .then(res => {
        if (!agent || !res.data.some(a => a.name === agent)) {
          window.location.hash = ''
        }
        store.agents.set(
          res.data.reduce(
            (acc, agent) => {
              acc[agent.name] = agent
              return acc
            },
            {} as Record<string, Agent>
          )
        )
        store.agentList.set(res.data.map(a => a.name))
      })
      .catch(toastError)
  }, [agent])
  return null
}
