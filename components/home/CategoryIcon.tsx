import {
  BarChart3,
  Book,
  Brain,
  Briefcase,
  Building,
  Calendar,
  Cloud,
  Container,
  Cpu,
  CreditCard,
  Database,
  EyeOff,
  FileText,
  Gamepad2,
  Globe,
  GraduationCap,
  Grid3X3,
  HardDrive,
  Heart,
  Home,
  Image,
  Layers,
  Link,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Music,
  Network,
  Package,
  Phone,
  Plane,
  Rss,
  Server,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Star,
  Truck,
  Tv,
  Users,
  Video,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

interface CategoryIconProps {
  category: string
  className?: string
  size?: number
}

const categoryIconMap: Record<string, LucideIcon> = {
  // Common categories from the app
  favorites: Star,
  all: Grid3X3,
  hidden: EyeOff,
  productivity: BarChart3,
  communication: Mail,
  development: Database,
  system: Settings,

  // Additional common categories
  analytics: BarChart3,
  monitoring: Monitor,
  security: Shield,
  social: Users,
  media: Image,
  entertainment: Gamepad2,
  music: Music,
  video: Video,
  messaging: MessageSquare,
  phone: Phone,
  location: MapPin,
  shopping: ShoppingCart,
  payment: CreditCard,
  health: Heart,
  energy: Zap,
  home: Home,
  business: Building,
  education: GraduationCap,
  learning: Book,
  work: Briefcase,
  tools: Wrench,
  infrastructure: Server,
  storage: HardDrive,
  hardware: Cpu,
  software: Layers,
  delivery: Package,
  logistics: Truck,
  travel: Plane,
  calendar: Calendar,
  documents: FileText,
  web: Globe,
  cloud: Cloud,
  mobile: Smartphone,

  // mine
  docker: Container,
  'container-management': Server,
  torrenting: Zap,
  networking: Network,
  rss: Rss,
  'load-balanced': Link,
  'artificial-intelligence': Brain,
  streaming: Tv,
  browsers: Globe,
}

export function CategoryIcon({ category, className = '', size = 16 }: CategoryIconProps) {
  'use memo'

  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '')
  const IconComponent = categoryIconMap[normalizedCategory] || Grid3X3

  return <IconComponent className={className} size={size} />
}
