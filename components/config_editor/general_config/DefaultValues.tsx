import { StoreMapInput } from '@/components/form/StoreMapInput'
import { ConfigSchema } from '@/types/godoxy'
import { configStore } from '../store'

export default function DefaultValues() {
  return (
    <div className="flex flex-col gap-6">
      <StoreMapInput
        label="Health Check"
        state={configStore.configObject.defaults.healthcheck}
        schema={ConfigSchema.properties.defaults.properties.healthcheck}
      ></StoreMapInput>
    </div>
  )
}
