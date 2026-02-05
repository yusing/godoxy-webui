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

import AccessControlConfigContent from './general_config/AccessControl'
import AutocertConfigContent from './general_config/AutocertConfigContent'
import DefaultValuesConfigContent from './general_config/DefaultValues'
import DomainMatchingConfigContent from './general_config/DomainMatching'
import EntrypointConfigContent from './general_config/EntrypointConfig'
import MaxmindConfigContent from './general_config/Maxmind'
import NotificationsConfigContent from './general_config/NotificationsConfig'
import ProxmoxConfigContent from './general_config/ProxmoxConfig'
import RouteProviderConfigContent from './general_config/RouteProviderConfig'
import MiddlewareComposeFormContent from './middleware_compose/MiddlewareComposeForm'
import NewRouteFormContent from './route_files/NewRouteForm'
import RouteListContent from './route_files/RouteList'

type Section = {
  id: string
  label: string
  icon: LucideIcon
  Content: (props: { isActive: boolean }) => React.ReactNode
  preload?: boolean
  diffPaths?: string[]
}

const configSections: Section[] = [
  {
    id: 'autocert',
    label: 'SSL Certificates',
    icon: Shield,
    Content: AutocertConfigContent,
    diffPaths: ['autocert'],
  },
  {
    id: 'access-control',
    label: 'Access Control',
    icon: Key,
    Content: AccessControlConfigContent,
    diffPaths: ['acl'],
  },
  {
    id: 'entrypoint',
    label: 'Entrypoint',
    icon: Globe,
    Content: EntrypointConfigContent,
    diffPaths: ['entrypoint'],
  },
  {
    id: 'route-providers',
    label: 'Route Providers',
    icon: Route,
    Content: RouteProviderConfigContent,
    diffPaths: ['providers.include', 'providers.docker', 'provider.agents'],
  },
  {
    id: 'proxmox',
    label: 'Proxmox',
    icon: Server,
    Content: ProxmoxConfigContent,
    diffPaths: ['providers.proxmox'],
  },
  {
    id: 'maxmind',
    label: 'MaxMind',
    icon: Brain,
    Content: MaxmindConfigContent,
    diffPaths: ['providers.maxmind'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    Content: NotificationsConfigContent,
    diffPaths: ['providers.notification'],
  },
  {
    id: 'match-domains',
    label: 'Domain Matching',
    icon: Link,
    Content: DomainMatchingConfigContent,
    diffPaths: ['match_domains'],
  },
  {
    id: 'default-values',
    label: 'Default Values',
    icon: Settings,
    Content: DefaultValuesConfigContent,
    diffPaths: ['defaults'],
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
    Content: MiddlewareComposeFormContent,
  },
]

const includeFileSections: Section[] = [
  {
    id: 'route-list',
    label: 'Route List',
    icon: Route,
    Content: RouteListContent,
  },
  {
    id: 'new-route',
    label: 'New Route',
    icon: Plus,
    Content: NewRouteFormContent,
    preload: true,
  },
]

export const sectionsByFileType = {
  config: { label: 'General Configurations', sections: configSections },
  middleware: { label: 'Middleware Compose', sections: middlewareSections },
  provider: { label: 'Include Files', sections: includeFileSections },
}
