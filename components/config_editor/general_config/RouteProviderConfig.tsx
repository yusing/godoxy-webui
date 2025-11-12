import { ListInput } from '@/components/form/ListInput'
import { MapInput } from '@/components/form/MapInput'
import { configStore } from '../store'

export default function RouteProviderConfigContent() {
  const providers = configStore.configObject.providers
  return (
    <div className="flex flex-col gap-4">
      <providers.include.Render>
        {(include, setInclude) => (
          <ListInput card label="Include Files" value={include ?? []} onChange={setInclude} />
        )}
      </providers.include.Render>
      <providers.agents.Render>
        {(agents, setAgents) => (
          <ListInput card label="Agents" value={agents ?? []} onChange={setAgents} />
        )}
      </providers.agents.Render>
      <providers.docker.Render>
        {(docker, setDocker) => (
          <MapInput card label="Docker" value={docker ?? {}} onChange={setDocker} />
        )}
      </providers.docker.Render>
    </div>
  )
}
