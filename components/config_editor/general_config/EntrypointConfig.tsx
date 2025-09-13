import { NamedListInput } from '@/components/form/NamedListInput'
import { MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import type { JSONSchema } from '@/types/schema'
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
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem as unknown as JSONSchema}
      value={workingValue}
      onChange={configStore.configObject.entrypoint.middlewares.set}
    />
  )
}
