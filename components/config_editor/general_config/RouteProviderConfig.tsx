import { StoreListInput } from '@/components/form/StoreListInput'
import { StoreMapInput } from '@/components/form/StoreMapInput'
import { configStore } from '../store'

export default function RouteProviderConfigContent() {
  const providers = configStore.configObject.providers
  return (
    <div className="flex flex-col gap-4">
      <StoreListInput card label="Include Files" state={providers.include} />
      <StoreListInput card label="Agents" state={providers.agents} />
      <StoreMapInput card label="Docker" state={providers.docker} />
    </div>
  )
}
