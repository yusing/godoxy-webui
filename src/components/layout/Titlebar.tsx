import { Link } from '@tanstack/react-router'
import { BookOpenText, Code, FlaskConical, Grid3X3, Route, Server } from 'lucide-react'
import { ModeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/site-config'
import LogoutButton from '../LogoutButton'
import VersionText from '../VersionText'

type Page = {
  href: string
  Icon: React.ElementType
  label: string
  desktopOnly?: boolean
  pureLink?: boolean
}

const pages: Page[] = [
  { href: '/', Icon: Grid3X3, label: 'Apps' },
  { href: '/config', Icon: Code, label: 'Config' },
  { href: '/routes', Icon: Route, label: 'Routes' },
  { href: '/playground', Icon: FlaskConical, label: 'Playground' },
  { href: '/servers', Icon: Server, label: 'Servers' },
  { href: '/docs', Icon: BookOpenText, label: 'Docs', pureLink: true },
] as const

export default function Titlebar() {
  return (
    <div
      id="titlebar"
      className="titlebar hidden
      data-[hidden=false]:flex data-[hidden=false]:justify-between
      data-[hidden=false]:sm:grid data-[hidden=false]:sm:grid-cols-[auto_1fr_auto_max-content]
      data-[sidebar-open=true]:ml-(--sidebar-width)
      inset-x-0 items-center px-4 border-b surface z-40 backdrop-blur-sm sticky top-0"
    >
      <div className="flex items-center gap-2">
        <img src="/icon0.svg" alt="GoDoxy" width={24} height={24} />
        <span className="text-sm sm:text-base font-semibold tracking-tight leading-none whitespace-nowrap">
          {siteConfig.metadata.title}
        </span>
        <VersionText className="hidden sm:inline leading-none" />
      </div>
      <div className="flex items-center sm:pl-4 gap-3 sm:gap-4 text-sm text-muted-foreground">
        {pages.map(page => (
          <Item key={page.href} {...page} />
        ))}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
        <ModeToggle />
        <LogoutButton className="inline-flex items-center gap-2 hover:text-foreground" />
      </div>
    </div>
  )
}

function Item({ href, Icon, label, desktopOnly, pureLink }: Page) {
  const content = (
    <div className="flex items-center gap-2 hover:text-foreground">
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  )

  if (pureLink) {
    return (
      <a
        href={href}
        className={cn(
          'titlebar-item data-[active=true]:text-primary',
          desktopOnly && 'hidden sm:inline'
        )}
        title={label}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      to={href}
      preload={false}
      className={cn(
        'titlebar-item data-[active=true]:text-primary',
        desktopOnly && 'hidden sm:inline'
      )}
      title={label}
    >
      {content}
    </Link>
  )
}
