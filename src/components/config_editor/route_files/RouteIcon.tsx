import type { Routes } from '@/types/godoxy'
import { IconFolder, IconGlobe, IconWifi, type IconProps } from '@tabler/icons-react'

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
