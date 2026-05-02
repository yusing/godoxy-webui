import { Conditional } from 'juststore'
import { Link } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import { Suspense } from 'react'
import { type UserTheme, useTheme } from '@/components/ThemeProvider'
import ConfigReloadButton from '@/components/config_editor/ConfigReloadButton'
import ConfigSaveButton from '@/components/config_editor/ConfigSaveButton'
import WebUiServerRouteForm from '@/components/settings/WebUiServerRouteForm'
import { configStore } from '@/components/config_editor/store'
import { GoDoxyErrorAlert } from '@/components/GoDoxyError'
import SystemStatsProvider from '@/components/home/SystemStatsProvider'
import { store } from '@/components/home/store'
import { StoreSelectField } from '@/components/store/Select'
import { StoreSwitchField } from '@/components/store/Switch'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldTitle } from '@/components/ui/field'
import { RadioGroup, RadioGroupField } from '@/components/ui/radio-group'
import { store as routesStore } from '@/components/routes/store'
import { cn } from '@/lib/utils'

const SETTINGS_NAV = [
  { id: 'settings-appearance', label: 'Appearance' },
  { id: 'settings-apps', label: 'Apps dashboard' },
  { id: 'settings-routes-list', label: 'Routes list' },
  { id: 'settings-webui-route', label: 'Web UI route' },
] as const

/** In-page anchor offset so section titles aren’t flush under the mobile pill nav. */
const scrollSection = 'scroll-mt-20 border-border/40 shadow-none md:scroll-mt-24'

function SettingsSection({
  id,
  title,
  description,
  children,
  className,
  span,
}: {
  id: string
  title: string
  description: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Full-width row on md+ (e.g. dense lists, nested forms). */
  span?: 'full'
}) {
  return (
    <Card id={id} className={cn(scrollSection, span === 'full' && 'md:col-span-2', className)}>
      <CardHeader className="border-b border-border/50">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

const navLinkClass =
  'rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground'

export default function WebUiSettings() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-2 sm:px-5 md:max-w-none lg:max-w-7xl lg:px-8 lg:pb-24 lg:pt-4">
      <header className="mb-3 border-b border-border/60 px-0 py-4 lg:mb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground lg:mt-2 lg:text-[0.9375rem] lg:leading-relaxed">
          Browser preferences and the GoDoxy Web UI route (
          <code className="rounded bg-muted px-1 font-mono text-xs">webui</code> in{' '}
          <Link
            to="/config"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Config
          </Link>
          ).
        </p>
      </header>

      <Suspense>
        <SystemStatsProvider />
      </Suspense>

      <nav
        aria-label="Settings sections"
        className="scrollbar-hidden -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-0.5 pt-0.5 sm:-mx-5 sm:px-5 md:hidden"
      >
        {SETTINGS_NAV.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8 lg:gap-10">
        <nav
          aria-label="Settings sections"
          className="sticky top-6 z-20 hidden h-fit w-44 shrink-0 flex-col gap-0.5 md:flex lg:top-8 lg:w-52"
        >
          {SETTINGS_NAV.map(({ id, label }) => (
            <a key={id} href={`#${id}`} className={navLinkClass}>
              {label}
            </a>
          ))}
        </nav>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:gap-8">
          <AppearanceSection />
          <AppsDashboardSection />
          <RoutesListSection />
          <GoDoxyWebUiRouteSection />
        </div>
      </div>
    </div>
  )
}

function AppearanceSection() {
  const { userTheme, setTheme } = useTheme()

  return (
    <SettingsSection
      id="settings-appearance"
      title="Appearance"
      description="Color theme applies across the apps grid, routes, config, and other Web UI pages."
    >
      <FieldGroup className="gap-6">
        <Field>
          <FieldTitle>Color theme</FieldTitle>
          <RadioGroup
            className="flex flex-wrap gap-x-6 gap-y-2 pt-1"
            value={userTheme}
            onValueChange={value => setTheme(value as UserTheme)}
          >
            <RadioGroupField id="theme-light" value="light" label="Light" />
            <RadioGroupField id="theme-dark" value="dark" label="Dark" />
            <RadioGroupField id="theme-system" value="system" label="System" />
          </RadioGroup>
        </Field>

        <StoreSwitchField
          state={store.ui.iconThemeAware}
          title="Theme-aware icons"
          labelPlacement="right"
          descriptionVariant="tooltip"
          description={
            <div className="max-w-xs space-y-2 text-xs">
              <p>Prefer monochrome light or dark icons based on the current theme.</p>
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground">
                <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-foreground">
                  Light icons
                </span>
                <span>
                  on <Moon className="inline size-3 align-text-bottom" /> dark mode
                </span>
              </p>
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground">
                <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-foreground">
                  Dark icons
                </span>
                <span>
                  on <Sun className="inline size-3 align-text-bottom" /> light mode
                </span>
              </p>
            </div>
          }
        />
      </FieldGroup>
    </SettingsSection>
  )
}

function AppsDashboardSection() {
  const sortMethod = store.settings.sortMethod.use()
  const secondDriveOptions = store.settings.secondDriveOptions.use()

  return (
    <SettingsSection
      id="settings-apps"
      title="Apps dashboard"
      description="Homepage grid, sorting, and storage stats shown in the dock bar."
    >
      <FieldGroup className="gap-6">
        <Field>
          <FieldTitle>Sort apps</FieldTitle>
          <RadioGroup
            className="grid max-w-xs gap-2 pt-1 sm:max-w-sm md:max-w-none"
            value={sortMethod}
            onValueChange={value => store.settings.sortMethod.set(value as typeof sortMethod)}
          >
            <RadioGroupField id="apps-sort-alpha" value="alphabetical" label="Alphabetical" />
            <RadioGroupField id="apps-sort-clicks" value="clicks" label="Most clicked" />
            <RadioGroupField id="apps-sort-custom" value="custom" label="Custom order" />
          </RadioGroup>
        </Field>

        <Conditional state={store.settings.secondDriveOptions} on={options => options.length > 0}>
          <StoreSelectField
            state={store.selectedSecondDrive}
            title="Second drive for stats"
            description="Disk usage shown next to root in the system stats strip."
            options={[undefined, ...secondDriveOptions]}
            className="max-w-md"
            capitalizeSelectItems={false}
          />
        </Conditional>

        <StoreSwitchField
          state={store.ui.segmentedByCategories}
          title="Segment by categories"
          labelPlacement="right"
          description="Group items into category sections in All and Favorites."
          descriptionVariant="tooltip"
        />

        <Conditional
          state={store.ui.showKeyboardHints}
          on={showKeyboardHints => !showKeyboardHints}
        >
          <Field>
            <FieldTitle>Keyboard hints</FieldTitle>
            <FieldDescription className="text-xs">
              The shortcut strip on the apps page was dismissed. You can bring it back below.
            </FieldDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-fit"
              onClick={() => store.ui.showKeyboardHints.set(true)}
            >
              Show keyboard hints
            </Button>
          </Field>
        </Conditional>
      </FieldGroup>
    </SettingsSection>
  )
}

const routesListToggles: {
  field: 'dockerOnly' | 'proxmoxOnly' | 'hideUnknown' | 'hideExcluded' | 'hideUptimebar'
  title: string
  description: string
}[] = [
  {
    field: 'dockerOnly',
    title: 'Docker routes only',
    description: 'Hide routes that are not backed by a Docker container.',
  },
  {
    field: 'proxmoxOnly',
    title: 'Proxmox routes only',
    description: 'Show only routes associated with Proxmox.',
  },
  {
    field: 'hideUnknown',
    title: 'Hide unknown status',
    description: 'Omit routes with no uptime or health signal yet.',
  },
  {
    field: 'hideExcluded',
    title: 'Hide excluded routes',
    description: 'Hide routes marked as non-proxied or excluded.',
  },
  {
    field: 'hideUptimebar',
    title: 'Hide uptime bar',
    description: 'Compact the route row by removing the uptime indicator.',
  },
]

function RoutesListSection() {
  return (
    <SettingsSection
      id="settings-routes-list"
      span="full"
      title="Routes list"
      description="Filters for the sidebar on the Routes page. They apply immediately."
    >
      <FieldGroup className="gap-5">
        {routesListToggles.map(({ field, title, description }) => (
          <StoreSwitchField
            key={field}
            state={routesStore.displaySettings[field]}
            title={title}
            labelPlacement="right"
            description={description}
            descriptionVariant="inline"
          />
        ))}
      </FieldGroup>
    </SettingsSection>
  )
}

function GoDoxyWebUiRouteSection() {
  const onMainConfig = configStore.activeFile.useCompute(
    f => f.type === 'config' && f.filename === 'config.yml'
  )
  const activeFilename = configStore.activeFile.useCompute(f => f.filename)
  const isLoading = configStore.isLoading.use()
  const loadError = configStore.error.use()
  const validateError = configStore.validateError.use()

  return (
    <Card id="settings-webui-route" className={cn(scrollSection, 'md:col-span-2')}>
      <CardHeader className="border-b border-border/50">
        <CardTitle>Web UI route</CardTitle>
        <CardDescription>
          Hostnames, TLS profile, access log, and middlewares for how the proxy serves this UI. Full
          YAML editing stays on the <Link to="/config">Config</Link> page.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4">
        {(!onMainConfig || isLoading) && (
          <p className="text-sm text-muted-foreground">Loading configuration…</p>
        )}
        {loadError && <FieldError>{loadError}</FieldError>}
        {onMainConfig && !isLoading && !loadError && <WebUiServerRouteForm />}
        {validateError && <GoDoxyErrorAlert title="Validation" err={validateError} />}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-xs text-muted-foreground">
          Saves the whole active configuration file ({activeFilename}).
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <ConfigReloadButton
            variant="outline"
            size="sm"
            aria-label="Reload from disk"
            title="Reload from disk"
          />
          <ConfigSaveButton
            variant="default"
            size="sm"
            aria-label="Save configuration"
            title="Save configuration"
          />
        </div>
      </CardFooter>
    </Card>
  )
}
