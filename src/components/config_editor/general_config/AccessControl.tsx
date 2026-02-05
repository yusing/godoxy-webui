import { useMemo } from 'react'
import { StoreListInput } from '@/components/form/StoreListInput'
import { StoreMapInput } from '@/components/form/StoreMapInput'
import { StoreCheckboxField } from '@/components/store/Checkbox'
import { StoreRadioField } from '@/components/store/Radio'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ACLSchema } from '@/types/godoxy'
import { configStore } from '../store'

const acl = configStore.configObject.acl
const aclNotify = configStore.state('configObject.acl.notify').ensureObject()

export default function AccessControlConfigContent() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Behavior</CardTitle>
        </CardHeader>
        <CardContent flex>
          <StoreRadioField state={acl.default.withDefault('allow')} options={['allow', 'deny']} />
          <StoreCheckboxField
            state={acl.allow_local.withDefault(true)}
            title="Allow local access"
          />
        </CardContent>
      </Card>
      <StoreMapInput
        label="Log Config"
        schema={ACLSchema.definitions.ACLLogConfig}
        state={acl.log.ensureObject()}
      />
      <ACLNotifyConfig />
      <StoreListInput label="Allow List" state={acl.allow.ensureArray()} />
      <StoreListInput label="Deny List" state={acl.deny.ensureArray()} />
    </div>
  )
}

function ACLNotifyConfig() {
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
    <StoreMapInput
      label="Notify Config"
      schema={schema}
      state={aclNotify}
      readonly={providerNames.length == 0}
      placeholder={{
        key: 'to',
        value: providerNames.length == 0 ? 'No notification providers configured' : undefined,
      }}
    />
  )
}
