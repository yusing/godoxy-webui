import { ListInput } from '@/components/form/ListInput'
import { MapInput } from '@/components/form/MapInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupField } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { ACLSchema } from '@/types/godoxy'
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
          <div className="flex flex-col gap-2">
            <Label>Default behavior</Label>
            <acl.default.Render>
              {(val, setVal) => (
                <RadioGroup
                  defaultValue="allow"
                  value={val ?? 'allow'}
                  onValueChange={e => setVal(e as 'allow' | 'deny')}
                >
                  <RadioGroupField label="Allow" value="allow" id="allow" />
                  <RadioGroupField label="Deny" value="deny" id="deny" />
                </RadioGroup>
              )}
            </acl.default.Render>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="allow_local">Allow local access</Label>
              <acl.allow_local.Render>
                {(val, setVal) => <Switch checked={val ?? true} onCheckedChange={setVal} />}
              </acl.allow_local.Render>
            </div>
          </div>
        </CardContent>
      </Card>
      <acl.log.Render>
        {(log, setLog) => (
          <MapInput
            label="Log Config"
            schema={ACLSchema.definitions.ACLLogConfig}
            value={log ?? {}}
            onChange={setLog}
          />
        )}
      </acl.log.Render>
      <acl.allow.Render>
        {(allow, setAllow) => (
          <ListInput label="Allow List" value={allow ?? []} onChange={setAllow} />
        )}
      </acl.allow.Render>
      <acl.deny.Render>
        {(deny, setDeny) => <ListInput label="Deny List" value={deny ?? []} onChange={setDeny} />}
      </acl.deny.Render>
    </div>
  )
}
