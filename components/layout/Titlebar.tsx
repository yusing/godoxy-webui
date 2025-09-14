import { ModeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import Logo from '@/public/godoxy-no-text.png'
import { siteConfig } from '@/site-config'
import { BookOpenText, Code, Grid3X3, Route, Server } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import LogoutButton from '../LogoutButton'
import VersionText from '../VersionText'

type Page = {
  href: string
  Icon: React.ElementType
  label: string
  desktopOnly?: boolean
}

const pages: Page[] = [
  { href: '/', Icon: Grid3X3, label: 'Apps' },
  { href: '/config', Icon: Code, label: 'Config', desktopOnly: true },
  { href: '/routes', Icon: Route, label: 'Routes' },
  { href: '/servers', Icon: Server, label: 'Servers' },
  { href: '/wiki/Home', Icon: BookOpenText, label: 'Wiki' },
] as const

export default function Titlebar() {
  return (
    <div
      id="titlebar"
      className="titlebar hidden data-[hidden=false]:flex data-[sidebar-open=true]:ml-[var(--sidebar-width)] fixed top-0 inset-x-0 items-center justify-between px-4 border-b surface z-40 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <Image src={Logo} alt="GoDoxy" width={24} height={24} />
        <span className="font-semibold tracking-tight">{siteConfig.metadata.title}</span>
        <VersionText />
        <div className="flex items-center ml-4 gap-4 text-sm text-muted-foreground">
          {pages.map(page => (
            <Item key={page.href} {...page} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
        <ModeToggle />
        <LogoutButton className="inline-flex items-center gap-2 hover:text-foreground" />
      </div>
    </div>
  )
}

function Item({ href, Icon, label, desktopOnly }: Page) {
  return (
    <Link
      prefetch={false}
      href={href}
      className={cn(
        'titlebar-item data-[active=true]:text-primary',
        desktopOnly && 'hidden sm:inline'
      )}
      title={label}
    >
      <div className="flex items-center gap-2 hover:text-foreground">
        <Icon className="size-4" /> <span className="hidden sm:inline">{label}</span>
      </div>
    </Link>
  )
}
