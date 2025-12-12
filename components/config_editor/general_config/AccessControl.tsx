import { MapInput } from '@/components/form/MapInput'
import { StoreListInput } from '@/components/form/StoreListInput'
import { StoreMapInput } from '@/components/form/StoreMapInput'
import { StoreCheckboxField } from '@/components/store/Checkbox'
import { StoreRadioField } from '@/components/store/Radio'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ACLSchema } from '@/types/godoxy'
import { useMemo } from 'react'
import { configStore } from '../store'

export default function AccessControlConfigContent() {
  const acl = configStore.configObject.acl
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Behavior</CardTitle>
        </CardHeader>
        <CardContent flex>
          <StoreRadioField state={acl.default} options={['allow', 'deny']} defaultValue="allow" />
          <StoreCheckboxField
            state={acl.allow_local}
            title="Allow local access"
            defaultValue={true}
          />
        </CardContent>
      </Card>
      <StoreMapInput
        label="Log Config"
        schema={ACLSchema.definitions.ACLLogConfig}
        state={acl.log}
      />
      <ACLNotifyConfig />
      <StoreListInput label="Allow List" state={acl.allow} />
      <StoreListInput label="Deny List" state={acl.deny} />
    </div>
  )
}

function ACLNotifyConfig() {
  const notify = configStore.configObject.acl.notify.use()
  const providerNames = configStore.configObject.providers.notification.useCompute(
    p => p?.map(p => p.name) ?? []
  )
  const schema = useMemo(() => {
    const s = structuredClone(ACLSchema.definitions.ACLConfig.properties.notify)
    if (providerNames.length == 0) {
      s.properties.to.type = 'string'
    } else {
      // @ts-expect-error this is correct
      s.properties.to.items.enum = providerNames
    }
    return s
  }, [providerNames])
  return (
    <MapInput
      label="Notify Config"
      schema={schema}
      value={notify ?? {}}
      placeholder={{
        key: 'to',
        value: providerNames.length == 0 ? 'No notification providers configured' : undefined,
      }}
      onChange={configStore.configObject.acl.notify.set}
    />
  )
}
