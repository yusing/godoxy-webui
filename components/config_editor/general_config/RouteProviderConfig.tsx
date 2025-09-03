import { ListInput } from '@/components/form/ListInput'
import { MapInput } from '@/components/form/MapInput'
import { configStore } from '../store'

export default function RouteProviderConfigContent() {
  return (
    <div className="flex flex-col gap-4">
      <configStore.Render path={`configObject.providers.include`}>
        {(include, setInclude) => (
          <ListInput label="Include Files" value={include ?? []} onChange={setInclude} />
        )}
      </configStore.Render>
      <configStore.Render path={`configObject.providers.agents`}>
        {(agents, setAgents) => (
          <ListInput label="Agents" value={agents ?? []} onChange={setAgents} />
        )}
      </configStore.Render>
      <configStore.Render path={`configObject.providers.docker`}>
        {(docker, setDocker) => (
          <MapInput label="Docker" value={docker ?? {}} onChange={setDocker} />
        )}
      </configStore.Render>
    </div>
  )
}
