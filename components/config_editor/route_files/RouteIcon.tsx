import type { Routes } from '@/types/godoxy'
import { Folder, Globe, Wifi, type LucideProps } from 'lucide-react'

export default function RouteIcon({
  scheme,
  className,
  ...props
}: {
  scheme: Routes.Route['scheme']
  className?: string
} & LucideProps) {
  if (scheme === 'fileserver') return <Folder className={className} {...props} />
  if (scheme === 'tcp' || scheme === 'udp') return <Wifi className={className} {...props} />
  return <Globe className={className} {...props} />
}
