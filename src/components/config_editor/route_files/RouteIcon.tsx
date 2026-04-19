import { Folder, Globe, Wifi, type LucideProps } from 'lucide-react'
import type { Routes } from '@/types/godoxy'

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
