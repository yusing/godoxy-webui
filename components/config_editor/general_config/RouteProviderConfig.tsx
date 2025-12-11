import { MapInput } from '@/components/form/MapInput'
import { StoreListInput } from '@/components/form/StoreListInput'
import { configStore } from '../store'

export default function RouteProviderConfigContent() {
  const providers = configStore.configObject.providers
  return (
    <div className="flex flex-col gap-4">
      <StoreListInput card label="Include Files" state={providers.include} />
      <StoreListInput card label="Agents" state={providers.agents} />
      <providers.docker.Render>
        {(docker, setDocker) => (
          <MapInput card label="Docker" value={docker ?? {}} onChange={setDocker} />
        )}
      </providers.docker.Render>
    </div>
  )
}
