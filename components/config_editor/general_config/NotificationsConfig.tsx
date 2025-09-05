import { NamedListInput } from '@/components/form/NamedListInput'
import { ConfigSchema } from '@/types/godoxy'
import type { NotificationConfig } from '@/types/godoxy/config/notification'
import type { JSONSchema } from '@/types/schema'
import { configStore } from '../store'

export default function NotificationsConfigContent() {
  const [config, setConfig] = configStore.configObject.providers.notification.useState()

  const setNotificationsConfig = (cfg: NotificationConfig[]) => {
    if (cfg.length === 0) {
      setConfig(undefined)
    } else {
      setConfig(cfg)
    }
  }

  return (
    <NamedListInput
      label="Notifications"
      keyField="provider"
      nameField="name"
      card={false}
      schema={
        ConfigSchema.definitions.Providers.properties.notification.items as unknown as JSONSchema
      }
      value={config ?? []}
      onChange={setNotificationsConfig}
    />
  )
}
