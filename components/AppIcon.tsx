import type { HomepageItem } from '@/lib/api'
import { cn } from '@/lib/utils'
import { memo, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface AppIconProps {
  size?: number | string
  item?: Partial<HomepageItem>
  url?: string
  className?: string
}

function AppIcon_({ size, item, url, className }: AppIconProps) {
  const appIconUrl = useMemo(() => {
    let iconURL = `/api/v1/favicon`
    if (url) {
      iconURL += `?url=${encodeURIComponent(url)}`
    } else if (item?.alias) {
      iconURL += `?alias=${item.alias}`
    } else {
      return undefined
    }
    return iconURL
  }, [item, url])

  return (
    <Avatar className={cn('rounded-md', className)} style={{ width: size, height: size }}>
      <AvatarImage src={appIconUrl} />
      {/* Fallback to use item alias first if both provided */}
      <AvatarFallback>
        {url && item ? (
          <AppIcon size={size} item={item} />
        ) : item?.alias ? (
          item.alias.slice(0, 2).toUpperCase()
        ) : (
          '?'
        )}
      </AvatarFallback>
    </Avatar>
  )
}

export const AppIcon = memo(AppIcon_, (prev, next) => {
  return (
    prev.item?.alias === next.item?.alias &&
    prev.url === next.url &&
    prev.size === next.size &&
    prev.className === next.className
  )
}) as typeof AppIcon_ & {
  displayName: string
}

AppIcon.displayName = 'AppIcon'
