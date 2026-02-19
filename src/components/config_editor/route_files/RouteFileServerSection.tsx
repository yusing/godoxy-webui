import { Conditional, type FormStore } from 'juststore'
import { StoreFormCheckboxField } from '@/components/store/Checkbox'
import { StoreFormInputField } from '@/components/store/Input'
import type { Routes } from '@/types/godoxy'

type RouteFileServerSectionProps = {
  form: FormStore<Routes.FileServerRoute>
}

export function RouteFileServerSection({ form }: RouteFileServerSectionProps) {
  return (
    <>
      <StoreFormInputField state={form.root} title="Root" placeholder="/path/to/files" required />
      <StoreFormCheckboxField
        state={form.spa}
        title="SPA"
        description={
          <span>
            Serve Single Page Applications (SPA) mode. Similar to nginx{' '}
            <code className="font-mono font-medium">try_files</code> directive.
          </span>
        }
      />
      <Conditional state={form.spa} on={spa => spa === true}>
        <StoreFormInputField state={form.index} title="Index" placeholder="/index.html" />
      </Conditional>
    </>
  )
}
