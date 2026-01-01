import type { Routes } from '@/types/godoxy'
import type { Port, StreamPort } from '@/types/godoxy/types'
import { IconFolder, IconGlobe, IconWifi } from '@tabler/icons-react'
import { Code } from './Code'

const routeSchemes = [
  {
    label: 'Reverse Proxy (http)',
    value: 'http',
    icon: IconGlobe,
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
    label: 'Reverse Proxy (h2c)',
    value: 'h2c',
    icon: IconGlobe,
    description: 'Proxy to a web app with HTTP/2 Clear-Text',
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
    icon: IconGlobe,
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
    icon: IconFolder,
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
    icon: IconWifi,
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
    icon: IconWifi,
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

function getProxyPort(port: Port | StreamPort | number | string): string {
  const s = String(port).split(':')
  if (s.length === 2) return s[1]!
  return s[0]!
}

function getListeningPort(port: StreamPort | Port | number | string): string {
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
  return `${route.scheme ?? 'http'}://${route.host}:${getProxyPort(route.port || (route.scheme === 'http' ? 80 : 443))}`
}

function getRouteType(scheme: Routes.Route['scheme']) {
  if (scheme === 'fileserver') return 'File Server'
  if (scheme === 'tcp' || scheme === 'udp') return 'Stream'
  return 'Reverse Proxy'
}

function getIconColorsByScheme(scheme: Routes.Route['scheme']): [string, string] {
  switch (getRouteType(scheme)) {
    case 'File Server':
      return ['bg-green-500/30 border-green-500/20', 'text-green-400']
    case 'Stream':
      return ['bg-indigo-500/30 border-indigo-500/20', 'text-indigo-400']
    case 'Reverse Proxy':
      return ['bg-blue-500/30 border-blue-500/20', 'text-blue-400']
    default:
      return ['bg-gray-500/30 border-gray-500/20', 'text-gray-400']
  }
}

export {
  getIconColorsByScheme,
  getListeningAddress,
  getListeningPort,
  getProxyAddressOrRoot,
  getProxyPort,
  getRouteType,
  routeSchemes,
}
