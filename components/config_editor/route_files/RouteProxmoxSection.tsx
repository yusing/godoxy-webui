import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormTextAreaField } from '@/components/store/TextArea'
import { FieldGroup } from '@/components/ui/field'
import type { Route as RouteResponse } from '@/lib/api'
import type { Routes } from '@/types/godoxy'
import type { FormStore } from 'juststore'
import { commaSeparatedToArray } from './utils'

type RouteProxmoxSectionProps = {
  form: FormStore<Routes.ReverseProxyRoute>
  details?: RouteResponse
}

export function RouteProxmoxSection({ form, details }: RouteProxmoxSectionProps) {
  return (
    <FieldGroup className="gap-4">
      <div className="flex gap-2">
        <StoreFormInputField
          state={form.proxmox.node}
          title="Node"
          placeholder={details?.proxmox?.node ?? 'pve'}
        />
        <StoreFormInputField
          state={form.proxmox.vmid}
          title="VMID"
          placeholder={details?.proxmox?.vmid?.toString() ?? '119'}
          type="number"
        />
      </div>
      <StoreFormInputField
        state={form.proxmox.services.derived({
          from: v => v?.join(',') ?? '',
          to: commaSeparatedToArray,
        })}
        title="Services"
        placeholder="nginx"
        description="Service names (comma-separated)"
      />
      <StoreFormTextAreaField
        state={form.proxmox.files.derived({
          from: v => v?.join('\n') ?? '',
          to: v => (v ? v.split('\n') : []),
        })}
        title="Log Files"
        placeholder="/var/log/nginx/access.log"
        description="Log file paths (newline-separated)"
      />
    </FieldGroup>
  )
}
