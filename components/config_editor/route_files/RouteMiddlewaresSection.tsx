import { NamedListInput } from '@/components/form/NamedListInput'
import type { FormState } from 'juststore'
import type { Middlewares, MiddlewareCompose } from '@/types/godoxy'
import { MiddlewareComposeSchema } from '@/types/godoxy'
import { middlewareUseToSnakeCase } from '../middleware_compose/utils'
import { useCallback, useMemo } from 'react'

type RouteMiddlewaresSectionProps = {
  state: FormState<Middlewares.MiddlewaresMap | undefined>
}

export function RouteMiddlewaresSection({ state }: RouteMiddlewaresSectionProps) {
  const [value, setValue] = state.useState()

  const workingValue: MiddlewareCompose.EntrypointMiddlewares = useMemo(() => {
    if (!value) return []
    return Object.entries(value).map(([key, value]) => ({
      use: middlewareUseToSnakeCase(key),
      ...value,
    }))
  }, [value])

  const onChangeMiddleware = useCallback(
    (data: MiddlewareCompose.EntrypointMiddlewares) => {
      setValue(
        data.reduce((acc, item) => {
          // @ts-expect-error intended
          acc[item.use] = item
          // remove the `use` field from the item (from the conversion above)
          delete (item as { use?: string }).use
          return acc
        }, {} as Middlewares.MiddlewaresMap)
      )
    },
    [setValue]
  )

  return (
    <NamedListInput
      label=""
      card={false}
      grid={false}
      nameField="use"
      keyField="use"
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={workingValue}
      onChange={onChangeMiddleware}
    />
  )
}
