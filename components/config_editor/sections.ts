import {
  Bell,
  Brain,
  Globe,
  Key,
  Link,
  Plus,
  Route,
  Server,
  Settings,
  Shield,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { lazy, type JSX, type LazyExoticComponent } from 'react'

type Section = {
  id: string
  label: string
  icon: LucideIcon
  Content: LazyExoticComponent<() => JSX.Element> | null
}

const configSections: Section[] = [
  {
    id: 'autocert',
    label: 'SSL Certificates',
    icon: Shield,
    Content: lazy(() => import('./general_config/AutocertConfigContent')),
  },
  {
    id: 'access-control',
    label: 'Access Control',
    icon: Key,
    Content: lazy(() => import('./general_config/AccessControl')),
  },
  {
    id: 'entrypoint',
    label: 'Entrypoint',
    icon: Globe,
    Content: lazy(() => import('./general_config/EntrypointConfig')),
  },
  {
    id: 'route-providers',
    label: 'Route Providers',
    icon: Route,
    Content: lazy(() => import('./general_config/RouteProviderConfig')),
  },
  {
    id: 'proxmox',
    label: 'Proxmox',
    icon: Server,
    Content: lazy(() => import('./general_config/ProxmoxConfig')),
  },
  {
    id: 'maxmind',
    label: 'MaxMind',
    icon: Brain,
    Content: lazy(() => import('./general_config/Maxmind')),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    Content: lazy(() => import('./general_config/NotificationsConfig')),
  },
  {
    id: 'match-domains',
    label: 'Domain Matching',
    icon: Link,
    Content: lazy(() => import('./general_config/DomainMatching')),
  },
  {
    id: 'default-values',
    label: 'Default Values',
    icon: Settings,
    Content: lazy(() => import('./general_config/DefaultValues')),
  },
  // {
  //   id: 'homepage',
  //   label: 'Homepage',
  //   icon: Home,
  //   description: 'Homepage configuration',
  // },
] as const

const middlewareSections: Section[] = [
  {
    id: 'middleware-list',
    label: 'Middleware List',
    icon: SlidersHorizontal,
    Content: lazy(() => import('./middleware_compose/MiddlewareComposeForm')),
  },
]

const includeFileSections: Section[] = [
  {
    id: 'route-list',
    label: 'Route List',
    icon: Route,
    Content: lazy(() => import('./route_files/RouteList')),
  },
  {
    id: 'new-route',
    label: 'New Route',
    icon: Plus,
    Content: lazy(() => import('./route_files/NewRouteForm')),
  },
]

export const sectionsByFileType = {
  config: { label: 'General Configurations', sections: configSections },
  middleware: { label: 'Middleware Compose', sections: middlewareSections },
  provider: { label: 'Include Files', sections: includeFileSections },
}
