import { IconPlus, IconX } from '@tabler/icons-react'
import React, { useMemo } from 'react'
import { NamedListInput } from '@/components/form/NamedListInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type MiddlewareCompose, MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import { middlewareUseToSnakeCase } from './utils'

export function MiddlewareEditor({
  label,
  data,
  onChange,
}: {
  label?: string
  data: MiddlewareCompose.EntrypointMiddlewares
  onChange: (v: MiddlewareCompose.EntrypointMiddlewares) => void
}) {
  const workingValue = useMemo(
    () =>
      data.map(item => ({
        ...item,
        use: middlewareUseToSnakeCase(item.use) as MiddlewareFileRef,
      })),
    [data]
  )
  return (
    <NamedListInput
      label={label}
      card={false}
      nameField="use"
      keyField="use"
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={workingValue}
      onChange={onChange}
    />
  )
}

export function MiddlewareComposeEditor({
  data,
  onChange,
}: {
  data: MiddlewareCompose.MiddlewareCompose
  onChange: (v: MiddlewareCompose.MiddlewareCompose) => void
}) {
  const [selectedTab, setSelectedTab] = React.useState<number | undefined>(
    Object.keys(data).length > 0 ? 0 : undefined
  )
  const keys = Object.keys(data)

  return (
    <Tabs
      value={selectedTab !== undefined ? String(selectedTab) : undefined}
      onValueChange={value => setSelectedTab(value ? Number(value) : undefined)}
      className="w-full"
    >
      <TabsList className="flex w-full flex-wrap gap-1 h-auto min-h-9 p-1">
        {keys.map((k, index) => (
          <TabsTrigger key={k} value={String(index)}>
            <span className="truncate max-w-[120px]">{k}</span>
            <button
              type="button"
              aria-label={`Delete ${k}`}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-destructive hover:text-destructive-foreground opacity-60 hover:opacity-100 transition-all cursor-pointer z-10 pointer-events-auto"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                const newData = { ...data }
                delete newData[k]
                onChange(newData)

                if (index === selectedTab) {
                  setSelectedTab(
                    Object.keys(newData).length > 0 ? Math.max(0, index - 1) : undefined
                  )
                } else if (selectedTab !== undefined && index < selectedTab) {
                  setSelectedTab(selectedTab - 1)
                }
              }}
              onPointerDown={e => e.stopPropagation()}
            >
              <IconX className="size-3.5" />
            </button>
          </TabsTrigger>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center gap-1 px-3"
          onClick={() => {
            const newData = { ...data }
            let newKey = Object.keys(newData).length
            const newIndex = newKey
            while (newData[newKey]) {
              newKey++
            }
            newData[newKey] = []
            onChange(newData)
            setSelectedTab(newIndex)
          }}
        >
          <IconPlus className="size-4" />
        </Button>
      </TabsList>
      {Object.entries(data).map(([k, v], index) => (
        <TabsContent key={k} value={String(index)} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label>Name</Label>
            <Input
              value={k}
              onChange={e => {
                const newName = e.target.value
                if (newName === k) return
                const entries = Object.entries(data)
                const idx = entries.findIndex(([key]) => key === k)
                if (idx === -1) return
                const newEntries: [string, MiddlewareCompose.EntrypointMiddlewares][] = entries.map(
                  (pair, i) =>
                    i === idx
                      ? [
                          newName,
                          (Array.isArray(v) ? v : []) as MiddlewareCompose.EntrypointMiddlewares,
                        ]
                      : (pair as [string, MiddlewareCompose.EntrypointMiddlewares])
                )
                const newData = Object.fromEntries(
                  newEntries
                ) as MiddlewareCompose.MiddlewareCompose
                onChange(newData)
              }}
              placeholder="MyMiddleware"
              className="w-full"
            />
          </div>
          <MiddlewareEditor
            label={k}
            data={(Array.isArray(v) ? v : []) as MiddlewareCompose.EntrypointMiddlewares}
            onChange={v => onChange({ ...data, [k]: v })}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default function TabView() {
  return <div>TabView</div>
}
