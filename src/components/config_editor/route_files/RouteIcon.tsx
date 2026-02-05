import { IconFolder, IconGlobe, type IconProps, IconWifi } from '@tabler/icons-react'
import type { Routes } from '@/types/godoxy'

export default function RouteIcon({
  scheme,
  className,
  ...props
}: {
  scheme: Routes.Route['scheme']
  className?: string
} & IconProps) {
  if (scheme === 'fileserver') return <IconFolder className={className} {...props} />
  if (scheme === 'tcp' || scheme === 'udp') return <IconWifi className={className} {...props} />
  return <IconGlobe className={className} {...props} />
}
