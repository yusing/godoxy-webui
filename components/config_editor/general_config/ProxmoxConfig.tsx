import { NamedListInput } from '@/components/form/NamedListInput'
import { ConfigSchema } from '@/types/godoxy'
import type { ProxmoxConfig } from '@/types/godoxy/providers/proxmox'
import { configStore } from '../store'

export default function ProxmoxConfigContent() {
  const [config, setConfig] = configStore.use('configObject.providers.proxmox')

  const setProxmoxConfig = (proxmoxConfig: ProxmoxConfig[]) => {
    if (proxmoxConfig.length === 0) {
      setConfig(undefined)
    } else {
      setConfig(proxmoxConfig)
    }
  }

  return (
    <NamedListInput
      label="Proxmox"
      keyField="url"
      nameField="url"
      card={false}
      schema={ConfigSchema.definitions.ProxmoxConfig}
      value={config ?? []}
      onChange={setProxmoxConfig}
    />
  )
}
