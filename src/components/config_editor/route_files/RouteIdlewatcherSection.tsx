import { StoreFormInputField, StoreInputField } from '@/components/store/Input'
import { StoreFormSelectField } from '@/components/store/Select'
import { FieldGroup } from '@/components/ui/field'
import { StoreFormCheckboxField } from '@/components/store/Checkbox'
import type { Routes } from '@/types/godoxy'
import { STOP_METHODS, STOP_SIGNALS } from '@/types/godoxy/providers/idlewatcher'
import type { FormStore } from 'juststore'
import { commaSeparatedToArray } from './utils'

type RouteIdlewatcherSectionProps = {
  form: FormStore<Routes.ReverseProxyRoute | Routes.StreamRoute>
}

export function RouteIdlewatcherSection({ form }: RouteIdlewatcherSectionProps) {
  return (
    <FieldGroup className="gap-4">
      <div className="flex gap-2">
        <StoreFormInputField
          state={form.idlewatcher.idle_timeout}
          title="Idle Timeout"
          placeholder="5m"
          description="Duration of inactivity before stopping"
        />
        <StoreFormInputField
          state={form.idlewatcher.wake_timeout}
          title="Wake Timeout"
          placeholder="30s"
          description="Time to wait for start"
        />
      </div>
      <div className="flex gap-2">
        <StoreFormInputField
          state={form.idlewatcher.stop_timeout}
          title="Stop Timeout"
          placeholder="30s"
          description="Time to wait for stop"
        />
        <StoreFormSelectField
          state={form.idlewatcher.stop_method}
          title="Stop Method"
          defaultValue="stop"
          options={STOP_METHODS}
        />
        <StoreFormSelectField
          state={form.idlewatcher.stop_signal}
          title="Stop Signal"
          defaultValue="SIGTERM"
          options={STOP_SIGNALS.filter(signal => signal.startsWith('SIG'))}
        />
      </div>
      <StoreFormInputField
        state={form.idlewatcher.start_endpoint}
        title="Start Endpoint"
        placeholder="/wake"
        description="Path to wake the resource"
      />
      <StoreFormCheckboxField
        state={form.idlewatcher.no_loading_page}
        title="No Loading Page"
        description="Disable loading page when waking up"
      />
      <StoreInputField
        state={form.idlewatcher.depends_on.derived({
          from: v => v?.join(','),
          to: commaSeparatedToArray,
        })}
        title="Depends On"
        placeholder="route1,route2"
        description="Routes to wait for before starting (comma separated)"
      />
    </FieldGroup>
  )
}
