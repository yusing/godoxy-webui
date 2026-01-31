import { NamedListInput } from '@/components/form/NamedListInput'
import type { MiddlewareCompose, Middlewares } from '@/types/godoxy'
import { MiddlewareComposeSchema } from '@/types/godoxy'
import type { FormState } from 'juststore'
import { useCallback, useMemo } from 'react'
import { middlewareUseToSnakeCase } from '../middleware_compose/utils'

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
        data.reduce((acc, { use, ...rest }) => {
          // @ts-expect-error intended
          acc[use] = rest
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
