import type { HomepageItem } from '@/lib/api'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface AppIconProps {
  size?: number | string
  item?: HomepageItem
  url?: string
  className?: string
}

function AppIcon_({ size, item, url, className }: AppIconProps) {
  return (
    <Avatar className={cn('rounded-md', className)} style={{ width: size, height: size }}>
      <AvatarImage src={`/api/v1/favicon?alias=${item?.alias ?? ''}&url=${url ?? ''}`} />
      <AvatarFallback>{item?.alias ? item.alias.slice(0, 2).toUpperCase() : '?'}</AvatarFallback>
    </Avatar>
  )
}

export const AppIcon = memo(AppIcon_, (prev, next) => {
  return prev.item?.alias === next.item?.alias && prev.url === next.url && prev.size === next.size
})

AppIcon.displayName = 'AppIcon'
