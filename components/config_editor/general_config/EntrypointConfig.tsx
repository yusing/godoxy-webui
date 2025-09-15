import { NamedListInput } from '@/components/form/NamedListInput'
import { MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import { useMemo } from 'react'
import { middlewareUseToSnakeCase } from '../middleware_compose/MiddlewareEditor'
import { configStore } from '../store'

export default function EntrypointConfigContent() {
  const middlewares = configStore.configObject.entrypoint.middlewares.use()
  const workingValue = useMemo(() => {
    return (middlewares ?? []).map(item => ({
      ...item,
      use: middlewareUseToSnakeCase(item.use) as MiddlewareFileRef,
    }))
  }, [middlewares])

  return (
    <NamedListInput
      card={false}
      label=""
      nameField="use"
      keyField="use"
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={workingValue}
      onChange={configStore.configObject.entrypoint.middlewares.set}
    />
  )
}
