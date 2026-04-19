import { X } from 'lucide-react'
import { type FormStore, RenderWithUpdate } from 'juststore'
import { StoreFormSelectField } from '@/components/store/Select'
import { Button } from '@/components/ui/button'
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
      <div className="flex items-end gap-2">
        <StoreFormSelectField
          state={form.inbound_mtls_profile}
          title="Inbound mTLS Profile"
          placeholder={
            profileNames.length > 0 ? 'Select a trust profile' : 'No mTLS profiles defined'
          }
          description="Optional named client-certificate trust profile for this HTTP-based route."
          options={profileNames}
          className="w-full"
          capitalizeSelectItems={false}
        />
        <RenderWithUpdate state={form.inbound_mtls_profile}>
          {(value, setValue) => (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setValue(undefined)}
              disabled={!value}
              aria-label="Clear mTLS profile selection"
            >
              <X className="size-4" />
            </Button>
          )}
        </RenderWithUpdate>
      </div>
    </FieldGroup>
  )
}
