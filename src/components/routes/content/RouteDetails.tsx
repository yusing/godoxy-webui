import { yaml } from '@codemirror/lang-yaml'
import { IconArrowRight, IconInfoCircle } from '@tabler/icons-react'
import { Fragment, useEffect } from 'react'
import { stringify as stringifyYAML } from 'yaml'
import { CodeBlock } from '@/components/CodeBlock'
import { CodeMirror } from '@/components/CodeMirror'
import { store, useSelectedRoute } from '@/components/routes/store'
import KeyboardReturn from '@/components/svg/keyboard-return'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataList, DataListRow } from '@/components/ui/data-list'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { HealthJSON, IdlewatcherConfig } from '@/lib/api'
import { blockRulesHighlightShiki } from '@/lib/codemirror/rules-block-shiki'
import { formatDuration, formatGoDuration, formatRelTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { decodeRouteKey } from '../utils'
import Logs from './Logs'
import LogsHeader, { getLogSourceBadgeText } from './LogsHeader'
import RouteResponseTimeChart from './ResponseTimeChart'

export default function RouteDetails() {
  const routeKey = useSelectedRoute()
  const activeRoute = decodeRouteKey(routeKey)
  const routeDetails = store.routeDetails[routeKey]?.use()

  const isStream = routeDetails?.scheme === 'tcp' || routeDetails?.scheme === 'udp'
  const isExcluded = routeDetails?.excluded
  const showHomepageConfiguration = !isStream && !isExcluded
  const showLogs = routeDetails?.container || routeDetails?.proxmox
  const logSourceBadge = showLogs
    ? getLogSourceBadgeText(routeDetails?.container, routeDetails?.proxmox)
    : ''
  const logType = routeDetails?.container
    ? 'Container'
    : routeDetails?.proxmox
      ? routeDetails.proxmox.vmid
        ? 'Proxmox VM'
        : 'Proxmox Node'
      : 'Unknown'

  useEffect(() => {
    if (routeKey) {
      if (!routeDetails) {
        store.routeDetails[routeKey]!.reset()
      }
    }
  }, [routeKey, routeDetails])

  if (!activeRoute) {
    return (
      <InlineEmpty
        title="No route selected"
        description="Pick a route from the sidebar to view details, logs, and metrics."
      />
    )
  }

  if (!routeDetails) {
    return (
      <InlineEmpty
        title="No route details available"
        description="Live route metadata has not arrived yet. The panel will update automatically."
      />
    )
  }

  // load balancer routes do not have healthcheck
  routeDetails.healthcheck ??= {
    disable: false,
    interval: 0,
    timeout: 0,
    retries: 0,
    use_get: false,
    path: '/',
  }

  return (
    <div className="space-y-4 w-full">
      {showLogs && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{logType} Logs</span>
              <Tooltip>
                <TooltipTrigger>
                  <IconInfoCircle className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <Label className="text-xs">
                    <Kbd>
                      <KeyboardReturn /> Enter
                    </Kbd>{' '}
                    to maximize / minimize
                  </Label>
                </TooltipContent>
              </Tooltip>
              <Badge variant="secondary" className="hidden lg:inline-flex max-w-[420px] truncate">
                {logSourceBadge}
              </Badge>
            </CardTitle>
            <CardDescription>
              <LogsHeader routeKey={routeKey} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Logs routeKey={routeKey} />
          </CardContent>
        </Card>
      )}
      {/* Basic Information */}
      <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-3 w-full">
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              {routeDetails.provider && (
                <DataListRow label="Provider" value={routeDetails.provider} />
              )}
              <DataListRow label="Alias" value={routeDetails.alias} />
              <DataListRow label="Agent" value={routeDetails.agent} />
              <DataListRow label="Host" value={routeDetails.host} />
              <DataListRow label="Scheme" value={routeDetails.scheme} />
              <DataListRow label="Origin URL" value={routeDetails.purl} className="break-all" />
              {routeDetails.lurl && (
                <DataListRow
                  label="Listening URL"
                  value={routeDetails.lurl}
                  className="break-all"
                />
              )}
            </DataList>
          </CardContent>
        </Card>
        <Card size="sm" className="lg:col-span-2 px-2">
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent className="-ml-6">
            <RouteResponseTimeChart />
          </CardContent>
        </Card>
      </div>
      {/* Ports */}
      {/* <Card size="sm">
        <CardHeader>
          <CardTitle>Ports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Item title="Listening Port" value={routeDetails.port?.listening} />
            <Item title="Origin Port" value={routeDetails.port?.proxy} />
          </div>
        </CardContent>
      </Card> */}
      {/* Status & Configuration */}
      <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3 w-full">
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow label="Route Excluded" value={routeDetails.excluded ? 'Yes' : 'No'} />
              {routeDetails.excluded_reason && (
                <DataListRow label="Excluded reason" value={routeDetails.excluded_reason} />
              )}
              {routeDetails.health && (
                <>
                  <DataListRow label="Status" value={routeDetails.health.status} />
                  <DataListRow
                    label="Latency"
                    value={formatDuration(routeDetails.health.latency, { unit: 'ms' })}
                  />
                  <DataListRow
                    label="Uptime"
                    value={formatDuration(routeDetails.health.uptime, { unit: 's' })}
                  />
                  <DataListRow
                    label="Last Seen"
                    value={formatRelTime(routeDetails.health.lastSeen)}
                  />
                  {routeDetails.health?.detail && (
                    <DataListRow label="Details" value={routeDetails.health.detail} />
                  )}
                </>
              )}
            </DataList>
          </CardContent>
        </Card>
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow
                label="Response Header Timeout"
                value={formatGoDuration(routeDetails.response_header_timeout) || '60s'}
              />
              {!isStream && (
                <DataListRow
                  label="Compression"
                  value={routeDetails.disable_compression ? 'Disabled' : 'Enabled'}
                />
              )}
              {routeDetails.scheme === 'https' && (
                <DataListRow
                  label="TLS Verify"
                  value={routeDetails.no_tls_verify ? 'Disabled' : 'Enabled'}
                />
              )}
            </DataList>
          </CardContent>
        </Card>
      </div>
      {/* Health Check & Homepage Configuration */}
      <div
        className={cn(
          'space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3 w-full',
          !showHomepageConfiguration && 'lg:grid-cols-1'
        )}
      >
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow
                label="Enabled"
                value={routeDetails.healthcheck.disable ? 'No' : 'Yes'}
              />
              <DataListRow label="Retries" value={routeDetails.healthcheck.retries} />
              <DataListRow
                label="Interval"
                value={formatGoDuration(routeDetails.healthcheck.interval)}
              />
              <DataListRow
                label="Timeout"
                value={formatGoDuration(routeDetails.healthcheck.timeout)}
              />
              <DataListRow
                label="Use GET"
                value={routeDetails.healthcheck.use_get ? 'Yes' : 'No'}
              />
              <DataListRow label="Path" value={routeDetails.healthcheck.path || '/'} />
            </DataList>
          </CardContent>
        </Card>
        {showHomepageConfiguration && (
          <Card size="sm" className="px-2">
            <CardHeader>
              <CardTitle>Homepage Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList>
                <DataListRow
                  label="Favorite"
                  value={routeDetails.homepage.favorite ? 'Yes' : 'No'}
                />
                <DataListRow label="Show" value={routeDetails.homepage.show ? 'Yes' : 'No'} />
                <DataListRow label="Name" value={routeDetails.homepage.name} />
                <DataListRow label="Category" value={routeDetails.homepage.category} />
                <DataListRow label="Description" value={routeDetails.homepage.description} />
                <DataListRow label="Icon" value={routeDetails.homepage.icon} />
                <DataListRow label="URL" value={routeDetails.homepage.url} className="break-all" />
              </DataList>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Rules */}
      {routeDetails.rules && routeDetails.rules.length > 0 && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Rules ({routeDetails.rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routeDetails.rules.map((rule, index) => (
                <Fragment key={rule.name || index}>
                  {rule.name && <div className="font-medium text-sm mb-2">{rule.name}</div>}
                  <CodeBlock
                    lang="block"
                    value={`${rule.on} {\n  ${rule.do}\n}`}
                    highlighter={blockRulesHighlightShiki}
                  />
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Path Patterns */}
      {routeDetails.path_patterns && routeDetails.path_patterns.length > 0 && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <Title>Path Patterns</Title>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {routeDetails.path_patterns.map(pattern => (
                <Badge key={pattern} variant="outline" className="font-mono">
                  {pattern}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Container Information */}
      {routeDetails.container && (
        <div>
          <Card size="sm" className="px-2 rounded-b-none">
            <CardHeader>
              <CardTitle>Container Information</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList>
                <DataListRow label="Name" value={routeDetails.container.container_name} />
                <DataListRow label="Docker Host" value={routeDetails.container.docker_cfg.url} />
                <DataListRow label="Image" value={routeDetails.container.image.name} />
                <DataListRow
                  label="Container ID"
                  value={routeDetails.container.container_id.slice(0, 12)}
                />
                <DataListRow label="Network" value={routeDetails.container.network} />
                <DataListRow
                  label="Public Hostname"
                  value={routeDetails.container.public_hostname}
                />
                <DataListRow
                  label="Private Hostname"
                  value={routeDetails.container.private_hostname}
                />
                <DataListRow
                  label="Container Excluded"
                  value={routeDetails.container.is_excluded ? 'Yes' : 'No'}
                />
              </DataList>
            </CardContent>
          </Card>

          <Card size="sm" className="px-2 rounded-t-none rounded-b-none">
            <CardHeader>
              <CardTitle>Public Ports</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList
                fallback={
                  <InlineEmpty
                    title="No public ports"
                    description="This container has no exposed public ports."
                  />
                }
              >
                {Object.entries(routeDetails.container.public_ports || {}).map(([key, port]) => (
                  <DataListRow
                    key={key}
                    label={`${port.IP}:${port.PublicPort}`}
                    value={`${port.PrivatePort}/${port.Type}`}
                    seperator={<IconArrowRight className="size-4" />}
                  />
                ))}
              </DataList>
            </CardContent>
          </Card>

          <Card size="sm" className="px-2 rounded-t-none rounded-b-none">
            <CardHeader>
              <CardTitle>Labels</CardTitle>
            </CardHeader>
            <CardContent>
              {routeDetails.container.labels &&
              Object.keys(routeDetails.container.labels).length > 0 ? (
                <DataList>
                  {Object.entries(routeDetails.container.labels).map(([key, value]) => (
                    <DataListRow key={key} label={key} value={value} />
                  ))}
                </DataList>
              ) : (
                <InlineEmpty
                  title="No labels"
                  description="This container does not expose labels."
                />
              )}
            </CardContent>
          </Card>
          <Card
            size="sm"
            className={cn('px-2 rounded-t-none', routeDetails.container.errors && 'rounded-b-none')}
          >
            <CardHeader>
              <CardTitle>Mounts</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList
                fallback={
                  <InlineEmpty
                    title="No mounts"
                    description="No filesystem mount bindings are reported for this container."
                  />
                }
              >
                {Object.entries(routeDetails.container?.mounts ?? {}).map(
                  ([source, destination]) => (
                    <DataListRow
                      key={source}
                      label={source}
                      value={destination}
                      seperator={<IconArrowRight className="size-4" />}
                    />
                  )
                )}
              </DataList>
            </CardContent>
          </Card>

          {routeDetails.container.errors && (
            <Card size="sm" className="px-2 rounded-t-none">
              <CardHeader>
                <CardTitle>Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-error">{routeDetails.container.errors}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {routeDetails.proxmox && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Proxmox</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow label="Node" value={routeDetails.proxmox.node} />
              <DataListRow label="VM ID" value={routeDetails.proxmox.vmid} />
              <DataListRow label="VM Name" value={routeDetails.proxmox.vmname} />
              <>
                {routeDetails.proxmox.services &&
                  routeDetails.proxmox.services.map((service, index) => (
                    <DataListRow key={service} label={`Service ${index + 1}`} value={service} />
                  ))}
              </>
              <>
                {routeDetails.proxmox.files &&
                  routeDetails.proxmox.files.map((file, index) => (
                    <DataListRow key={file} label={`File ${index + 1}`} value={file} />
                  ))}
              </>
            </DataList>
          </CardContent>
        </Card>
      )}
      {/* Load Balancer */}
      {routeDetails.health.extra && (
        <div className="space-y-2">
          <Card size="sm" className="px-2">
            <CardHeader>
              <CardTitle>Load Balancer Config</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList>
                <DataListRow label="Link" value={routeDetails.health.extra.config.link} />
                <DataListRow
                  label="Mode"
                  value={routeDetails.health.extra.config.mode || 'roundrobin'}
                />
                <DataListRow
                  label="Sticky"
                  value={routeDetails.health.extra.config.sticky ? 'Yes' : 'No'}
                />
                <DataListRow
                  label="Sticky max age"
                  value={
                    routeDetails.health.extra.config.sticky_max_age
                      ? formatGoDuration(routeDetails.health.extra.config.sticky_max_age)
                      : 'Default'
                  }
                />
                {/* <DataListRow
                  label="Weight"
                  value={String(routeDetails.health.extra.config.weight)}
                /> */}
                {routeDetails.health.extra.config.options &&
                  Object.keys(routeDetails.health.extra.config.options).length > 0 && (
                    <DataListRow
                      label="Options"
                      value={
                        <CodeBlock
                          lang="yaml"
                          value={stringifyYAML(routeDetails.health.extra.config.options)}
                          highlighter={blockRulesHighlightShiki}
                        />
                      }
                    />
                  )}
              </DataList>
            </CardContent>
          </Card>
          {routeDetails.health.extra.pool &&
            Object.keys(routeDetails.health.extra.pool).length > 0 && (
              <Card size="sm" className="px-2">
                <CardHeader>
                  <CardTitle>Pool servers</CardTitle>
                  <CardDescription>
                    Health status of each backend in the load balancer pool
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(routeDetails.health.extra.pool).map(([addr, entry]) => {
                      const info = entry as HealthJSON
                      return (
                        <div
                          key={addr}
                          className="rounded-md border border-border/60 bg-muted/20 p-3"
                        >
                          <div className="font-medium text-sm mb-2">{`${addr} (${info.name})`}</div>
                          <DataList>
                            {info.status && <DataListRow label="Status" value={info.status} />}
                            <DataListRow
                              label="Latency"
                              value={formatDuration(info.latency, {
                                unit: 'ms',
                              })}
                            />
                            <DataListRow
                              label="Uptime"
                              value={formatDuration(info.uptime, {
                                unit: 's',
                              })}
                            />
                            {info.detail !== '' && (
                              <DataListRow label="Detail" value={info.detail} />
                            )}
                            <DataListRow label="URL" value={info.url} />
                          </DataList>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}
      {/* Middlewares */}
      {routeDetails.middlewares && Object.keys(routeDetails.middlewares).length > 0 && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Middlewares</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeMirror value={stringifyYAML(routeDetails.middlewares)} extensions={[yaml()]} />
          </CardContent>
        </Card>
      )}
      {/* Additional Configuration */}
      {(routeDetails.access_log || routeDetails.idlewatcher) && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Additional Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {routeDetails.access_log && (
              <div>
                <Title>Access Log</Title>
                <CodeMirror
                  className="mt-1"
                  value={stringifyYAML(routeDetails.access_log)}
                  extensions={[yaml()]}
                />
              </div>
            )}

            {routeDetails.idlewatcher && (
              <div>
                <Title>Idle Watcher</Title>
                <CodeMirror
                  className="mt-1"
                  value={stringifyYAML(formatIdlewatcher(routeDetails.idlewatcher))}
                  extensions={[yaml()]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatIdlewatcher(idlewatcher: IdlewatcherConfig) {
  return {
    ...idlewatcher,
    idle_timeout: formatGoDuration(idlewatcher.idle_timeout),
    wake_timeout: formatGoDuration(idlewatcher.wake_timeout),
    stop_timeout: formatGoDuration(idlewatcher.stop_timeout),
  }
}

function Title({ children }: { children: React.ReactNode }) {
  return <Label className="text-muted-foreground">{children}</Label>
}

function InlineEmpty({ title, description }: { title: string; description: string }) {
  return (
    <Empty className="sm:col-span-3 border-border/40 bg-muted/10 py-4">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconInfoCircle className="size-4" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}
