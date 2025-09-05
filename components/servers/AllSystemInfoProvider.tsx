'use client'

import { useFragment } from '@/hooks/fragment'
import { useWebSocketApi } from '@/hooks/websocket'
import type { Agent, SystemInfo } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { useQuery } from '@tanstack/react-query'
import { store } from './store'

export default function AllSystemInfoProvider() {
  const agent = useFragment()

  useWebSocketApi<Record<string, SystemInfo>>({
    endpoint: '/metrics/all_system_info',
    onMessage: data => {
      for (const agent in data) {
        store.systemInfo[agent]?.set(data[agent]!)
      }
      store.readyState.set(true)
    },
    onError: () => store.readyState.set(false),
    onClose: () => store.readyState.set(false),
  })

  useQuery({
    queryKey: ['agent_list'],
    queryFn: () =>
      api.agent
        .list()
        .then(res => {
          if (!agent || !res.data.some(a => a.name === agent)) {
            window.location.hash = ''
          }
          store.set(
            'agents',
            res.data.reduce(
              (acc, agent) => {
                acc[agent.name] = agent
                return acc
              },
              {} as Record<string, Agent>
            )
          )
        })
        .then(() => true)
        .catch(toastError),
  })
  return null
}
