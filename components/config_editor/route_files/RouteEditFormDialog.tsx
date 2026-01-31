import { GoDoxyErrorAlert, type GoDoxyError } from '@/components/GoDoxyError'
import YAMLEditor from '@/components/YAMLEditor'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useWebSocketApi } from '@/hooks/websocket'
import { cn } from '@/lib/utils'
import type { Routes } from '@/types/godoxy'
import { IconCircleCheck } from '@tabler/icons-react'
import type { Atom } from 'juststore'
import { createAtom } from 'juststore'
import React, { useEffect, useId, useRef } from 'react'
import { stringify as stringifyYAML } from 'yaml'
import type { RouteEditFormProps } from './RouteEditForm'
import RouteEditForm from './RouteEditForm'

export default function RouteEditFormDialogContent({
  className,
  onUpdate,
  ...props
}: Omit<RouteEditFormProps, 'dialog'>) {
  const sendRouteRef = useRef<((yaml: Routes.Route) => void) | null>(null)
  const routeAtom = createAtom<Routes.Route>(
    `route-edit-form-dialog-content-${useId()}`,
    props.route
  )
  const errorAtom = createAtom<GoDoxyError | undefined>(
    `route-edit-form-dialog-content-error-${useId()}`,
    undefined
  )

  return (
    <DialogContent
      className={cn('min-w-[90vw] min-h-[90vh]', className)}
      showCloseButton={false}
      initialFocus={false}
    >
      <div className="grid grid-cols-[1fr_1px_500px] gap-2">
        <ScrollArea className="h-[90vh]">
          <RouteEditForm
            className="pr-2"
            dialog
            onUpdate={route => {
              routeAtom.set(route)
              sendRouteRef.current?.(route)
              if (onUpdate) {
                onUpdate(route)
              }
            }}
            {...props}
          />
        </ScrollArea>
        <Separator orientation="vertical" />
        <div className="flex flex-col gap-2">
          <Label className="pl-2 text-sm">Read-only Preview</Label>
          <routeAtom.Render>
            {value => <YAMLEditor readOnly value={stringifyYAML(value)} className="flex-1" />}
          </routeAtom.Render>
          <RouteErrorAlert errAtom={errorAtom} />
        </div>
      </div>
      <RouteValidationProvider sendRouteRef={sendRouteRef} errorAtom={errorAtom} />
    </DialogContent>
  )
}

function RouteErrorAlert({ errAtom }: { errAtom: Atom<GoDoxyError | undefined> }) {
  const err = errAtom.use()
  if (!err)
    return (
      <Alert variant="success">
        <IconCircleCheck />
        <AlertTitle>Valid</AlertTitle>
        <AlertDescription>The configuration is valid.</AlertDescription>
      </Alert>
    )
  return <GoDoxyErrorAlert title="Error" err={err} />
}

function RouteValidationProvider({
  sendRouteRef,
  errorAtom,
}: {
  sendRouteRef: React.RefObject<((yaml: Routes.Route) => void) | null>
  errorAtom: Atom<GoDoxyError | undefined>
}) {
  const { sendMessage } = useWebSocketApi({
    endpoint: '/route/validate',
    deduplicate: false,
    onMessage: data => {
      if (data && typeof data === 'object' && 'error' in data) {
        errorAtom.set(data.error as GoDoxyError)
      } else {
        errorAtom.reset()
      }
    },
  })

  useEffect(() => {
    sendRouteRef.current = (yaml: Routes.Route) => {
      sendMessage(stringifyYAML(yaml))
    }
  }, [sendRouteRef, sendMessage])

  return null
}
