'use client'

import { CodeMirror } from '@/components/ObjectDataList'
import { useSelectedRoute } from '@/components/routes/store'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Code from '@/components/ui/code'
import { DataList, DataListRow } from '@/components/ui/data-list'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { formatDuration, formatRelTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { yaml } from '@codemirror/lang-yaml'
import { IconArrowRight } from '@tabler/icons-react'
import { useAsync } from 'react-use'
import { stringify as stringifyYAML } from 'yaml'
import { decodeRouteKey } from '../utils'
import ContainerLogs from './ContainerLogs'
import ContainerLogsHeader from './ContainerLogsHeader'
import RouteResponseTimeChart from './ResponseTimeChart'

export default function RouteDetails() {
  const activeRoute = decodeRouteKey(useSelectedRoute())
  const { value: routeDetails, error } = useAsync(
    async () =>
      activeRoute ? api.route.route(activeRoute).then(res => res.data) : Promise.resolve(null),
    [activeRoute]
  )

  const isStream = routeDetails?.scheme === 'tcp' || routeDetails?.scheme === 'udp'
  const isExcluded = routeDetails?.excluded
  const showHomepageConfiguration = !isStream && !isExcluded

  if (!activeRoute) {
    return <div className="p-4 text-muted-foreground">Select a route to view details.</div>
  }

  if (error) {
    return <div className="p-4 text-muted-foreground">Error: {error.message}</div>
  }

  if (!routeDetails) {
    return <div className="p-4 text-muted-foreground">No route details available.</div>
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
    <div className="space-y-2 w-full">
      {routeDetails.container && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Container Logs</CardTitle>
            <CardDescription>
              <ContainerLogsHeader container={routeDetails.container} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContainerLogs containerId={routeDetails.container.container_id} />
          </CardContent>
        </Card>
      )}
      {/* Basic Information */}
      <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:divide-x w-full">
        <Card size="sm" className="md:rounded-r-none px-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Item title="Alias" value={routeDetails.alias} />
            <Item title="Agent" value={routeDetails.agent} />
            <Item title="Host" value={routeDetails.host} className="font-mono" />
            <Item title="Scheme" value={routeDetails.scheme} kind="badge" />
            <Item title="Origin URL" value={routeDetails.purl} className="font-mono break-all" />
            {routeDetails.lurl && (
              <Item
                title="Listening URL"
                value={routeDetails.lurl}
                className="font-mono break-all"
              />
            )}
          </CardContent>
        </Card>
        <Card size="sm" className="md:col-span-2 md:rounded-l-none px-2">
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
      <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:divide-x w-full">
        <Card size="sm" className="md:rounded-r-none px-2">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Item
              title="Route Excluded"
              value={routeDetails.excluded ? 'Yes' : 'No'}
              kind="badge"
              variant={routeDetails.excluded ? 'destructive' : 'outline'}
            />
            {routeDetails.health && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {routeDetails.excluded_reason && (
                    <Item title="Excluded reason" value={routeDetails.excluded_reason} />
                  )}
                  <Item title="Status" value={routeDetails.health.status} />
                  <Item
                    title="Latency"
                    value={formatDuration(routeDetails.health.latency, { unit: 'ms' })}
                  />
                  <Item
                    title="Uptime"
                    value={formatDuration(routeDetails.health.uptime, { unit: 's' })}
                  />
                  <Item title="Last Seen" value={formatRelTime(routeDetails.health.lastSeen)} />
                </div>
                {routeDetails.health.detail && (
                  <div className="md:col-span-2">
                    <Title>Details</Title>
                    <div className="text-sm">{routeDetails.health.detail}</div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Card size="sm" className="md:rounded-l-none px-2">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {routeDetails.response_header_timeout && (
                <Item
                  title="Response Header Timeout"
                  value={`${routeDetails.response_header_timeout} ms`}
                />
              )}
              {(routeDetails.scheme === 'http' ||
                routeDetails.scheme === 'https' ||
                routeDetails.scheme === 'h2c') && (
                <Item
                  title="Compression"
                  value={routeDetails.disable_compression ? 'Disabled' : 'Enabled'}
                  kind="badge"
                  variant={routeDetails.disable_compression ? 'destructive' : 'secondary'}
                />
              )}
              {routeDetails.scheme === 'https' && (
                <Item
                  title="TLS Verify"
                  value={routeDetails.no_tls_verify ? 'Disabled' : 'Enabled'}
                  kind="badge"
                  variant={routeDetails.no_tls_verify ? 'destructive' : 'secondary'}
                />
              )}
            </div>

            {routeDetails.provider && (
              <div>
                <Label className="text-muted-foreground">Provider</Label>
                <div className="text-sm">{routeDetails.provider}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Health Check & Homepage Configuration */}
      <div
        className={cn(
          'space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:divide-x w-full',
          !showHomepageConfiguration && 'md:grid-cols-1'
        )}
      >
        <Card size="sm" className="md:rounded-r-none px-2">
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Item
                title="Enabled"
                value={routeDetails.healthcheck.disable ? 'No' : 'Yes'}
                variant={routeDetails.healthcheck.disable ? 'destructive' : 'secondary'}
              />
              <Item title="Retries" value={routeDetails.healthcheck.retries} />
              <Item
                title="Interval"
                value={formatDuration(routeDetails.healthcheck.interval / 1000, { unit: 'us' })}
              />
              <Item
                title="Timeout"
                value={formatDuration(routeDetails.healthcheck.timeout / 1000, { unit: 'us' })}
              />
              <Item
                title="Use GET"
                value={routeDetails.healthcheck.use_get ? 'Yes' : 'No'}
                variant="outline"
              />
              <Item
                title="Path"
                value={routeDetails.healthcheck.path || '/'}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>
        {showHomepageConfiguration && (
          <Card size="sm" className="md:rounded-l-none px-2">
            <CardHeader>
              <CardTitle>Homepage Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Item
                  title="Favorite"
                  value={routeDetails.homepage.favorite ? 'Yes' : 'No'}
                  kind="badge"
                  variant={routeDetails.homepage.favorite ? 'secondary' : 'outline'}
                />
                <Item
                  title="Show"
                  value={routeDetails.homepage.show ? 'Yes' : 'No'}
                  kind="badge"
                  variant={routeDetails.homepage.show ? 'secondary' : 'outline'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Item title="Name" value={routeDetails.homepage.name} />
                <Item title="Category" value={routeDetails.homepage.category} />
                <Item title="Description" value={routeDetails.homepage.description} />
                <Item title="Icon" value={routeDetails.homepage.icon} className="font-mono" />
              </div>
              <Item title="URL" value={routeDetails.homepage.url} className="font-mono break-all" />
            </CardContent>
          </Card>
        )}
      </div>
      {/* Rules */}
      {routeDetails.rules && routeDetails.rules.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Rules ({routeDetails.rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routeDetails.rules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="font-medium text-sm mb-2">{rule.name}</div>
                  <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1 items-center">
                    <div className="text-xs text-muted-foreground">Action</div>
                    <Code className="w-full">{rule.do}</Code>
                    <div className="text-xs text-muted-foreground">Condition</div>
                    <Code className="w-full">{rule.on}</Code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Path Patterns */}
      {routeDetails.path_patterns && routeDetails.path_patterns.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <Title>Path Patterns</Title>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {routeDetails.path_patterns.map((pattern, index) => (
                <Badge key={index} variant="outline" className="font-mono">
                  {pattern}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Container Information */}
      {routeDetails.container && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Docker Container</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Item
                title="Name"
                value={routeDetails.container.container_name}
                className="font-mono"
              />
              <Item
                title="Docker Host"
                value={routeDetails.container.docker_cfg.url}
                className="font-mono"
              />
              <Item title="Image" value={routeDetails.container.image.name} className="font-mono" />
              <Item
                title="Container ID"
                value={routeDetails.container.container_id.slice(0, 12)}
                className="font-mono"
              />
              <Item title="Network" value={routeDetails.container.network} />
              <Item title="Public Hostname" value={routeDetails.container.public_hostname} />
              <Item title="Private Hostname" value={routeDetails.container.private_hostname} />
            </div>

            <div className="flex gap-4">
              {/* <Item
                title="Running"
                value={routeDetails.container.running ? 'Yes' : 'No'}
                kind="badge"
                variant={routeDetails.container.running ? 'secondary' : 'destructive'}
              /> */}
              <Item
                title="Container Excluded"
                value={routeDetails.container.is_excluded ? 'Yes' : 'No'}
                kind="badge"
                variant={routeDetails.container.is_excluded ? 'destructive' : 'outline'}
              />
            </div>

            <div>
              <Title>Public Ports</Title>
              <div className="text-sm font-mono">
                {Object.entries(routeDetails.container.public_ports || {}).map(([key, port]) => (
                  <div key={key}>
                    {port.IP}:{port.PublicPort} → {port.PrivatePort}/{port.Type}
                  </div>
                )) || 'No public ports exposed'}
              </div>
            </div>

            <div className="space-y-2">
              <Title>Labels</Title>
              {routeDetails.container.labels &&
              Object.keys(routeDetails.container.labels).length > 0 ? (
                <DataList labels={Object.keys(routeDetails.container.labels)}>
                  {Object.entries(routeDetails.container.labels).map(([key, value]) => (
                    <DataListRow key={key} label={key} value={value} />
                  ))}
                </DataList>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">No labels</div>
              )}
            </div>
            <div className="space-y-2">
              <Title>Mounts</Title>
              {routeDetails.container.mounts &&
              Object.keys(routeDetails.container.mounts).length > 0 ? (
                <DataList labels={Object.keys(routeDetails.container.mounts)}>
                  {Object.entries(routeDetails.container.mounts).map(([source, destination]) => (
                    <DataListRow
                      key={source}
                      label={source}
                      value={destination}
                      seperator={<IconArrowRight className="size-4" />}
                    />
                  ))}
                </DataList>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">No mounts</div>
              )}
            </div>

            {routeDetails.container.errors && (
              <div>
                <Title>Errors</Title>
                <div className="text-sm text-error">{routeDetails.container.errors}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Load Balancer */}
      {routeDetails.load_balance && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Load Balancer</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeMirror
              className="mt-1"
              value={stringifyYAML(routeDetails.load_balance)}
              extensions={[yaml()]}
            />
          </CardContent>
        </Card>
      )}
      {/* Middlewares */}
      {routeDetails.middlewares && Object.keys(routeDetails.middlewares).length > 0 && (
        <Card size="sm">
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
        <Card size="sm">
          <CardHeader>
            <CardTitle>Additional Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  value={stringifyYAML(routeDetails.idlewatcher)}
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

function Title({ children }: { children: React.ReactNode }) {
  return <Label className="text-muted-foreground">{children}</Label>
}

function Item({
  title,
  value,
  className,
  kind = 'text',
  variant = 'secondary',
}: {
  title: string
  value: string | number | undefined | null
  kind?: 'text' | 'badge'
  variant?: 'secondary' | 'outline' | 'destructive' | 'outline'
  className?: string
}) {
  return (
    <div className={cn(kind === 'badge' && 'flex items-center gap-4')}>
      <Title>{title}</Title>
      {kind === 'badge' ? (
        <Badge variant={variant}>{value || 'None'}</Badge>
      ) : (
        <div className={cn('text-sm', className)}>
          {value || <span className={cn('text-muted-foreground', className)}>None</span>}
        </div>
      )}
    </div>
  )
}
