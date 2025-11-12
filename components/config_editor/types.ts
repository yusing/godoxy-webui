import { Code, Route } from 'lucide-react'

export const fileTypeLabels = {
  config: { label: 'GoDoxy Config', value: 'config', icon: Code },
  provider: { label: 'Route Files', value: 'provider', icon: Route },
  middleware: { label: 'Middleware Compose', value: 'middleware', icon: Code },
} as const
