import { ModeToggle } from '@/components/ui/theme-toggle'
import { siteConfig } from '@/site-config'
import { Code, Grid3X3, Route, Server } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from '../LogoutButton'
import VersionText from '../VersionText'

const pages = [
  { href: '/', Icon: Grid3X3, label: 'Apps' },
  { href: '/config', Icon: Code, label: 'Config' },
  { href: '/routes', Icon: Route, label: 'Routes' },
  { href: '/servers', Icon: Server, label: 'Servers' },
] as const

export default function Titlebar() {
  return (
    <div
      id="titlebar"
      className="titlebar hidden data-[hidden=false]:flex data-[sidebar-open=true]:ml-[var(--sidebar-width)] fixed top-0 inset-x-0 items-center justify-between px-4 border-b surface z-40 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <img src="/godoxy-no-text.png" alt="GoDoxy" width={24} height={24} />
        <span className="font-semibold tracking-tight">{siteConfig.metadata.title}</span>
        <VersionText />
        <div className="flex items-center ml-4 gap-4 text-sm text-muted-foreground">
          {pages.map(({ href, Icon, label }) => (
            <Item key={href} href={href} icon={<Icon className="size-4" />}>
              {label}
            </Item>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <ModeToggle />
        <LogoutButton className="inline-flex items-center gap-2 hover:text-foreground" />
      </div>
    </div>
  )
}

function Item({
  children,
  icon,
  href,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  href: string
}) {
  return (
    <Link prefetch={false} href={href} className="titlebar-item data-[active=true]:text-primary">
      <div className="inline-flex items-center gap-2 hover:text-foreground">
        {icon} {children}
      </div>
    </Link>
  )
}
