import { ModeToggle } from '@/components/ui/theme-toggle'
import { getPathname } from '@/lib/ssr'
import { siteConfig } from '@/site-config'
import { Grid3X3, Monitor, Settings } from 'lucide-react'

export default async function Titlebar() {
  const pathname = await getPathname()
  if (pathname === '/login') {
    return null
  }
  return (
    <div className="flex fixed top-0 inset-x-0 h-12 items-center justify-between px-4 border-b surface z-40 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Monitor className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">{siteConfig.metadata.title}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button className="inline-flex items-center gap-2 hover:text-foreground">
          <Grid3X3 className="size-4" />
          Apps
        </button>
        <button className="inline-flex items-center gap-2 hover:text-foreground">
          <Settings className="size-4" />
          Settings
        </button>
        <ModeToggle></ModeToggle>
      </div>
    </div>
  )
}
