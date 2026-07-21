import { api } from '@/lib/api-client'

export type ContainerAction = 'start' | 'stop' | 'restart'

export type ContainerControlTarget =
  | { type: 'docker'; containerID: string }
  | { type: 'proxmox'; node: string; vmid: number }

export function getContainerControlTarget(
  containerID?: string | null,
  proxmox?: { node: string; vmid?: number | null } | null
): ContainerControlTarget | null {
  if (containerID) {
    return { type: 'docker', containerID }
  }
  if (proxmox?.vmid && proxmox.vmid > 0) {
    return { type: 'proxmox', node: proxmox.node, vmid: proxmox.vmid }
  }
  return null
}

export function isProxmoxActionEnabled(action: ContainerAction, status: string) {
  if (!status) return false
  return action === 'start' ? status !== 'running' : status === 'running'
}

export function runContainerAction(action: ContainerAction, target: ContainerControlTarget) {
  if (target.type === 'docker') {
    const request = { id: target.containerID }
    switch (action) {
      case 'start':
        return api.docker.start(request)
      case 'stop':
        return api.docker.stop(request)
      case 'restart':
        return api.docker.restart(request)
    }
  }

  switch (action) {
    case 'start':
      return api.proxmox.lxcStart(target.node, target.vmid)
    case 'stop':
      return api.proxmox.lxcStop(target.node, target.vmid)
    case 'restart':
      return api.proxmox.lxcRestart(target.node, target.vmid)
  }
}
