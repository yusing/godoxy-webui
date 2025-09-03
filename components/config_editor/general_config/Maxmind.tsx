import { MapInput } from '@/components/form/MapInput'
import { MaxmindSchema } from '@/types/godoxy'
import { configStore } from '../store'

export default function MaxmindConfigContent() {
  const [maxmindConfig, setMaxmindConfig] = configStore.use('configObject.providers.maxmind')

  return (
    <MapInput
      label="Maxmind"
      card={false}
      schema={MaxmindSchema.definitions.MaxmindConfig}
      value={maxmindConfig}
      onChange={setMaxmindConfig}
    />
  )
}
