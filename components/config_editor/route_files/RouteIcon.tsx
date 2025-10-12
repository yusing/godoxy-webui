import type { Routes } from '@/types/godoxy'
import { Folder, Globe, Wifi } from 'lucide-react'

export default function RouteIcon({
  scheme,
  className,
}: {
  scheme: Routes.Route['scheme']
  className?: string
}) {
  if (scheme === 'fileserver') return <Folder className={className} />
  if (scheme === 'tcp' || scheme === 'udp') return <Wifi className={className} />
  return <Globe className={className} />
}
