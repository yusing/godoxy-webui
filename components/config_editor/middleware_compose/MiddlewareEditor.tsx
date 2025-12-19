'use client'

import { NamedListInput } from '@/components/form/NamedListInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type MiddlewareCompose, MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import { IconPlus, IconX } from '@tabler/icons-react'
import React, { useMemo } from 'react'
import { middlewareUseToSnakeCase } from './utils'

export function MiddlewareEditor({
  label,
  data,
  onChange,
}: {
  label?: React.ReactNode
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
      value={String(selectedTab)}
      onValueChange={value => setSelectedTab(Number(value))}
      className="w-full"
    >
      <TabsList className="flex w-full flex-wrap gap-1">
        {keys.map((k, index) => (
          <TabsTrigger key={`${index}_tab`} value={String(index)}>
            <div className="relative flex items-center justify-between gap-2 pr-6">
              <span className="truncate">{k}</span>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                type="button"
                onPointerDownCapture={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  const newData = { ...data }
                  const kIndex = index
                  const currentIndex = selectedTab ?? 0
                  const nextIndex = Math.max(
                    0,
                    kIndex < currentIndex ? currentIndex - 1 : currentIndex
                  )
                  delete newData[k]
                  onChange(newData)
                  if (currentIndex !== nextIndex) {
                    setSelectedTab(nextIndex)
                  }
                }}
              >
                <IconX className="size-4 text-muted-foreground" />
              </Button>
            </div>
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
        <TabsContent
          key={`${index}_content`}
          value={String(index)}
          className="mt-4 flex flex-col gap-4"
        >
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
