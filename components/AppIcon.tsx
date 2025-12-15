import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export { AppIcon, type AppIconProps }
type AppIconProps = {
  size?: number | string
  className?: string
  alias?: string
  url?: string
  /** mutually exclusive with variant */
  themeAware?: boolean
  /** mutually exclusive with themeAware */
  variant?: 'light' | 'dark'
  fallback?: React.ReactNode
}

function AppIcon({
  size,
  className,
  alias,
  url,
  variant,
  fallback,
  themeAware = false,
}: AppIconProps) {
  'use memo'

  const { theme } = useTheme()

  const appIconUrl = useMemo(() => {
    const iconURL = `/api/v1/favicon`
    const query = new URLSearchParams()
    if (variant) {
      query.set('variant', variant)
    } else if (themeAware && theme) {
      switch (theme) {
        case 'dark':
          query.set('variant', 'light')
          break
        case 'light':
          query.set('variant', 'dark')
          break
      }
    }
    if (url) {
      query.set('url', url)
    }
    if (alias) {
      query.set('alias', alias)
    }
    return `${iconURL}?${query.toString()}`
  }, [variant, themeAware, theme, alias, url])

  return (
    <Avatar className={cn('rounded-md', className)} style={{ width: size, height: size }}>
      <AvatarImage src={appIconUrl} />
      {/* Fallback to use item alias first if both provided */}
      <AvatarFallback>
        {fallback ? fallback : alias ? alias.slice(0, 2).toUpperCase() : '?'}
      </AvatarFallback>
    </Avatar>
  )
}
