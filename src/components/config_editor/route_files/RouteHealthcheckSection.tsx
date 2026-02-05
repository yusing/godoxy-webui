import type { FormStore } from 'juststore'
import { StoreFormCheckboxField } from '@/components/store/Checkbox'
import { StoreFormInputField } from '@/components/store/Input'
import { FieldGroup } from '@/components/ui/field'
import type { Routes } from '@/types/godoxy'

type RouteHealthcheckSectionProps = {
  form: FormStore<Routes.Route>
}

export function RouteHealthcheckSection({ form }: RouteHealthcheckSectionProps) {
  return (
    <FieldGroup className="gap-4">
      <StoreFormCheckboxField state={form.healthcheck.disable} title="Disable" />
      <form.healthcheck.disable.Show on={disable => disable !== true}>
        <StoreFormInputField state={form.healthcheck.path} title="Path" placeholder="/" />
        <StoreFormCheckboxField state={form.healthcheck.use_get} title="Use GET" />
        <div className="flex gap-2">
          <StoreFormInputField
            state={form.healthcheck.interval}
            title="Interval"
            placeholder="5s"
          />
          <StoreFormInputField state={form.healthcheck.timeout} title="Timeout" placeholder="5s" />
          <StoreFormInputField
            type="number"
            state={form.healthcheck.retries}
            title="Retries"
            placeholder="3"
          />
        </div>
      </form.healthcheck.disable.Show>
    </FieldGroup>
  )
}
