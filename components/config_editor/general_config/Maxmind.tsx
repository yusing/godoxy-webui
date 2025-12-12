import { StoreMapInput } from '@/components/form/StoreMapInput'
import { MaxmindSchema } from '@/types/godoxy'
import { configStore } from '../store'

export default function MaxmindConfigContent() {
  return (
    <StoreMapInput
      label="Maxmind"
      card={false}
      schema={MaxmindSchema.definitions.MaxmindConfig}
      state={configStore.configObject.providers.maxmind}
    />
  )
}
