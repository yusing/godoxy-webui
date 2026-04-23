import { type FormStore } from 'juststore'
import { StoreFormSelectField } from '@/components/store/Select'
import { FieldGroup } from '@/components/ui/field'
import type { Routes } from '@/types/godoxy'
import { configStore } from '../store'

type RouteInboundMTLSSectionProps = {
  form: FormStore<Routes.ReverseProxyRoute | Routes.FileServerRoute>
}

export function RouteInboundMTLSSection({ form }: RouteInboundMTLSSectionProps) {
  const profileNames = configStore.configObject.inbound_mtls_profiles.keys.use()

  return (
    <FieldGroup className="gap-4">
      <StoreFormSelectField
        state={form.inbound_mtls_profile}
        title="Inbound mTLS Profile"
        placeholder={
          profileNames.length > 0 ? 'Select a trust profile' : 'No mTLS profiles defined'
        }
        description="Optional named client-certificate trust profile for this HTTP-based route."
        options={profileNames.length ? [undefined, ...profileNames] : []} // add undefined to allow clearing the selection
        className="w-full"
        capitalizeSelectItems={false}
      />
    </FieldGroup>
  )
}
