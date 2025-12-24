import { IconCode, IconRoute } from '@tabler/icons-react'


export const fileTypeLabels = {
  config: { label: 'GoDoxy Config', value: 'config', icon: IconCode },
  provider: { label: 'Route Files', value: 'provider', icon: IconRoute },
  middleware: { label: 'Middleware Compose', value: 'middleware', icon: IconCode },
} as const
