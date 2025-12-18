import { StoreListInput } from '@/components/form/StoreListInput'
import { StoreMapInput } from '@/components/form/StoreMapInput'
import { configStore } from '../store'

export default function RouteProviderConfigContent() {
  const providers = configStore.configObject.providers
  return (
    <div className="flex flex-col gap-4">
      <StoreListInput card label="Include Files" state={providers.include.ensureArray()} />
      <StoreListInput card label="Agents" state={providers.agents.ensureArray()} />
      <StoreMapInput card label="Docker" state={providers.docker.ensureObject()} />
    </div>
  )
}
