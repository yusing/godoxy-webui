import type { Routes } from '@/types/godoxy'
import type { Port, StreamPort } from '@/types/godoxy/types'
import { Folder, Globe, Wifi } from 'lucide-react'
import { Code } from './Code'

const routeSchemes = [
  {
    label: 'Reverse Proxy (http)',
    value: 'http',
    description: 'Proxy to a web app',
    cardDescription: (route: Routes.ReverseProxyRoute) => {
      return (
        <span>
          Proxy to{' '}
          <code>
            http://{route.host}:{route.port ?? '80'}
          </code>
        </span>
      )
    },
  },
  {
    label: 'Reverse Proxy (https)',
    value: 'https',
    description: 'Proxy to a secure web app over https',
    cardDescription: (route: Routes.ReverseProxyRoute) => {
      return (
        <span>
          Proxy to{' '}
          <code>
            https://{route.host}:{route.port ?? '443'}
          </code>
        </span>
      )
    },
  },
  {
    label: 'File Server',
    value: 'fileserver',
    description: 'Serve static files',
    cardDescription: (route: Routes.FileServerRoute) => {
      return (
        <span>
          Serve files from <code>{route.root}</code>
        </span>
      )
    },
  },
  {
    label: 'Stream (tcp)',
    value: 'tcp',
    description: 'Port forward a tcp app',
    cardDescription: (route: Routes.StreamRoute) => {
      return (
        <span>
          Port forward from <Code>tcp://:{getListeningPort(route.port) || 'random port'}</Code>
          {' to '}
          <Code>
            tcp://{route.host}:{getProxyPort(route.port)}
          </Code>
        </span>
      )
    },
  },
  {
    label: 'Stream (udp)',
    value: 'udp',
    description: 'Port forward a udp app',
    cardDescription: (route: Routes.StreamRoute) => {
      return (
        <span>
          Port forward from <Code>udp://:{getListeningPort(route.port) || 'random port'}</Code>
          {' to '}
          <Code>
            udp://{route.host}:{getProxyPort(route.port)}
          </Code>
        </span>
      )
    },
  },
] as const

function getProxyPort(port: Port | StreamPort | number): string {
  const s = String(port).split(':')
  if (s.length === 2) return s[1]!
  return s[0]!
}

function getListeningPort(port: StreamPort | number): string {
  const s = String(port).split(':')
  if (s.length === 1) return '0'
  return s[0]!
}

function getListeningAddress(route: Routes.Route): string | undefined {
  if (route.scheme !== 'tcp' && route.scheme !== 'udp') {
    const proto = typeof window !== 'undefined' ? window.location.protocol : 'https:'
    return `${proto}//:443`
  }
  return `${route.scheme}://:${getListeningPort(route.port)}`
}

function getProxyAddressOrRoot(route: Routes.Route): string {
  if (route.scheme === 'fileserver') return route.root
  return `${route.scheme ?? 'http'}://${route.host}:${getProxyPort(route.port || route.scheme === 'http' ? 80 : 443)}`
}

function getRouteIcon(scheme: Routes.Route['scheme']) {
  if (scheme === 'fileserver') return Folder
  if (scheme === 'tcp' || scheme === 'udp') return Wifi
  return Globe
}

function getRouteType(scheme: Routes.Route['scheme']) {
  if (scheme === 'fileserver') return 'File Server'
  if (scheme === 'tcp' || scheme === 'udp') return 'Stream'
  return 'Reverse Proxy'
}

export {
  getListeningAddress,
  getListeningPort,
  getProxyAddressOrRoot,
  getProxyPort,
  getRouteIcon,
  getRouteType,
  routeSchemes,
}
