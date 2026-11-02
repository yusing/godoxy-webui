import { Conditional, type FormStore } from 'juststore'
import { useEffect } from 'react'
import { StoreListInput } from '@/components/form/StoreListInput'
import { StoreFormCheckboxField } from '@/components/store/Checkbox'
import { StoreFormInputField } from '@/components/store/Input'
import { FieldGroup } from '@/components/ui/field'
import type { Routes } from '@/types/godoxy'

type RouteHealthcheckSectionProps = {
  form: FormStore<Routes.Route>
}

export function RouteHealthcheckSection({ form }: RouteHealthcheckSectionProps) {
  // An empty list would opt the route out of defaults.healthcheck.silence, so
  // removing the last window drops the key instead.
  useEffect(
    () =>
      form.healthcheck.silence.subscribe(windows => {
        if (windows?.length === 0) form.healthcheck.silence.reset()
      }),
    [form]
  )

  return (
    <FieldGroup className="gap-4">
      <StoreFormCheckboxField state={form.healthcheck.disable} title="Disable" />
      <Conditional state={form.healthcheck.disable} on={disable => disable !== true}>
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
      </Conditional>
      <StoreListInput
        label="Silence windows"
        description="Daily local-time windows (HH:MM-HH:MM) without service down alerts; replaces the default windows when set"
        placeholder="02:00-04:30"
        state={form.healthcheck.silence.ensureArray()}
      />
    </FieldGroup>
  )
}
