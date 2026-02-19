import {
  IconCheck,
  IconFolders,
  IconHeart,
  IconLock,
  IconRoute,
  IconServer,
  IconSettings,
  IconStack2,
  IconTimeDuration30,
  IconX,
} from '@tabler/icons-react'
import type { VariantProps } from 'class-variance-authority'
import type { FormState } from 'juststore'
import { type FormStore, Render, useForm } from 'juststore'
import { useEffect, useMemo } from 'react'
import { encodeRouteKey } from '@/components/routes/utils'
import { FormSection, SectionedForm, type SectionItem } from '@/components/SectionedForm'
import { Button, type buttonVariants } from '@/components/ui/button'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Routes } from '@/types/godoxy'
import { configStore } from '../store'
import { RouteFileServerSection } from './RouteFileServerSection'
import { RouteGeneralSection } from './RouteGeneralSection'
import { RouteHealthcheckSection } from './RouteHealthcheckSection'
import { RouteHTTPConfigSection } from './RouteHTTPConfigSection'
import { RouteIdlewatcherSection } from './RouteIdlewatcherSection'
import { RouteMiddlewaresSection } from './RouteMiddlewaresSection'
import { RouteProxmoxSection } from './RouteProxmoxSection'
import RouteSSLConfigSection from './RouteSSLConfigSection'
import { isHTTP, isStream } from './utils'

export type RouteEditFormProps = {
  className?: string
  route: Routes.Route
  alias: string
  dialog?: boolean
  onSecondAction: (form: FormStore<Routes.Route>) => void
  onUpdate?: (route: Routes.Route) => void
  onSave: (route: Routes.Route) => void
  titlePortal?: (props: { children: React.ReactNode }) => React.ReactNode
  actionButtonsPortal?: (props: { children: React.ReactNode }) => React.ReactNode
  formatTitle?: (alias: string) => React.ReactNode
  saveButtonIcon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >
  saveButtonText?: string
  secondActionButtonIcon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >
  secondActionButtonText?: string
  secondActionButtonVariant?: VariantProps<typeof buttonVariants>['variant']
  secondActionButtonClassName?: string
}

type FormSectionId =
  | 'general'
  | 'fileserver'
  | 'http'
  | 'ssl'
  | 'healthcheck'
  | 'proxmox'
  | 'idlewatcher'
  | 'middlewares'

export default function RouteEditForm({
  className,
  route,
  alias,
  dialog = false,
  onSecondAction,
  onUpdate,
  onSave,
  titlePortal: TitlePortal,
  actionButtonsPortal: ActionButtonsPortal,
  formatTitle = (alias: string) => `Edit Route: ${alias}`,
  saveButtonIcon = IconCheck,
  saveButtonText = 'Done',
  secondActionButtonIcon = IconX,
  secondActionButtonText = 'Cancel',
  secondActionButtonVariant = 'ghost',
  secondActionButtonClassName,
}: RouteEditFormProps) {
  const details = configStore.routeDetails[encodeRouteKey(alias)]?.use()
  const scheme = route.scheme ?? details?.scheme
  const host = 'host' in route ? route.host : undefined
  const port = 'port' in route ? route.port : undefined
  const form = useForm<Routes.Route>({
    ...route,
    alias,
    scheme,
    host,
    port,
  } as Routes.Route)

  useEffect(() => {
    if (onUpdate) {
      const unsubscribe = form.subscribe(onUpdate)
      return unsubscribe
    }
    return undefined
  }, [onUpdate, form])

  const formScheme = form.scheme as FormState<string | undefined>
  const currentScheme = (formScheme.use() ?? details?.scheme) || 'http'
  const showFileServer = currentScheme === 'fileserver'
  const showHTTPConfig = isHTTP(currentScheme)
  const showSSLConfig = currentScheme === 'https'
  const showProxmox = true
  const showIdlewatcher = isHTTP(currentScheme) || isStream(currentScheme)
  const showMiddlewares = isHTTP(currentScheme)

  const sections: SectionItem<FormSectionId>[] = useMemo(
    () =>
      [
        { id: 'general', label: 'General', Icon: IconRoute, show: true },
        {
          id: 'fileserver',
          label: 'File Server',
          Icon: IconFolders,
          show: showFileServer,
        },
        { id: 'http', label: 'HTTP Config', Icon: IconSettings, show: showHTTPConfig },
        { id: 'ssl', label: 'SSL Config', Icon: IconLock, show: showSSLConfig },
        { id: 'healthcheck', label: 'Health Check', Icon: IconHeart, show: true },
        { id: 'proxmox', label: 'Proxmox', Icon: IconServer, show: showProxmox },
        {
          id: 'idlewatcher',
          label: 'Idlewatcher',
          Icon: IconTimeDuration30,
          show: showIdlewatcher,
        },
        {
          id: 'middlewares',
          label: 'Middlewares',
          Icon: IconStack2,
          show: showMiddlewares,
        },
      ] as const,
    [showFileServer, showHTTPConfig, showSSLConfig, showIdlewatcher, showMiddlewares]
  )

  const SaveButtonIcon = saveButtonIcon
  const SecondActionButtonIcon = secondActionButtonIcon

  const actionButtons = (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={secondActionButtonVariant}
        size="sm"
        onClick={() => onSecondAction(form)}
        className={secondActionButtonClassName}
      >
        <SecondActionButtonIcon className="size-4" />
        {secondActionButtonText}
      </Button>
      <Button type="submit" size="sm">
        <SaveButtonIcon className="size-4" />
        {saveButtonText}
      </Button>
    </div>
  )

  const formSectionCN = ''

  return (
    <form
      onSubmit={form.handleSubmit(values => {
        onSave(values)
        form.reset()
      })}
      className={cn('flex flex-col gap-4 h-full min-h-0', !dialog && '-mx-1')}
    >
      {dialog && formatTitle && (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <Render state={form.alias}>{alias => <span>{formatTitle(alias ?? '')}</span>}</Render>
              {actionButtons}
            </DialogTitle>
          </DialogHeader>
          <Separator />
        </>
      )}
      {!dialog && formatTitle && TitlePortal && (
        <Render state={form.alias}>
          {alias => <TitlePortal>{formatTitle(alias ?? '')}</TitlePortal>}
        </Render>
      )}
      {!dialog && ActionButtonsPortal && <ActionButtonsPortal>{actionButtons}</ActionButtonsPortal>}

      <SectionedForm<FormSectionId>
        sections={sections}
        defaultSection="general"
        dialog={dialog}
        className="pr-2 snap-y snap-mandatory scroll-smooth"
      >
        {({ contentRef }) => (
          <div
            ref={contentRef}
            className={cn('min-w-0 min-h-0 overflow-y-auto flex flex-col gap-4', className)}
          >
            <FormSection
              id="general"
              title="General"
              description="Basic route settings"
              className={formSectionCN}
            >
              <RouteGeneralSection form={form} details={details} />
            </FormSection>

            <FormSection
              id="fileserver"
              title="File Server"
              description="Serve static files from a directory"
              className={formSectionCN}
            >
              <RouteFileServerSection form={form as FormStore<Routes.FileServerRoute>} />
            </FormSection>

            <FormSection
              id="http"
              title="HTTP Config"
              description="Configure HTTP-specific settings"
              className={formSectionCN}
            >
              <RouteHTTPConfigSection form={form as FormStore<Routes.ReverseProxyRoute>} />
            </FormSection>

            <FormSection
              id="ssl"
              title="SSL Config"
              description="Configure SSL-specific settings"
              className={formSectionCN}
            >
              <RouteSSLConfigSection form={form as FormStore<Routes.ReverseProxyRoute>} />
            </FormSection>

            <FormSection
              id="healthcheck"
              title="Healthcheck"
              description="Monitor the health of the route"
              className={formSectionCN}
            >
              <RouteHealthcheckSection form={form} />
            </FormSection>

            <FormSection
              id="proxmox"
              title="Proxmox"
              description="Stream logs from Proxmox nodes, idlewatcher integration"
              className={formSectionCN}
            >
              <RouteProxmoxSection
                form={form as FormStore<Routes.ReverseProxyRoute>}
                details={details}
              />
            </FormSection>

            <FormSection
              id="idlewatcher"
              title="Idlewatcher"
              description="Automatically stop and start resources when idle"
              className={formSectionCN}
            >
              <RouteIdlewatcherSection
                form={form as FormStore<Routes.ReverseProxyRoute | Routes.StreamRoute>}
              />
            </FormSection>

            <FormSection id="middlewares" title="Middlewares" className={formSectionCN}>
              <RouteMiddlewaresSection
                state={(form as FormStore<Routes.ReverseProxyRoute>).middlewares}
              />
            </FormSection>
          </div>
        )}
      </SectionedForm>
    </form>
  )
}
