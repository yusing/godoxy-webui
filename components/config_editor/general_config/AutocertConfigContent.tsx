'use client'

import { Suspense, useCallback, type InputHTMLAttributes } from 'react'

import { ListInput } from '@/components/form/ListInput'
import { MapInput } from '@/components/form/MapInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Autocert, AutocertSchema } from '@/types/godoxy'
import type { DomainOrWildcard, Email } from '@/types/godoxy/types'
import { IconPlus } from '@tabler/icons-react'
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react'
import { configStore } from '../store'
import AutocertInfo from './AutocertInfo'
import AutocertRenewDialogButton from './AutocertRenewDialogButton'

export default function AutocertConfigContent() {
  const [cfg, setCfg] = configStore.configObject.autocert.useState()

  const provider = cfg?.provider ?? 'local'

  const setProvider = useCallback(
    (next: Autocert.AutocertProvider) => {
      if (next === 'local') {
        const nextCfg: Autocert.LocalOptions = {
          provider: 'local',
          cert_path: undefined,
          key_path: undefined,
          options: null,
        }
        setCfg(nextCfg)
        return
      }

      // Preserve existing common fields when switching provider
      const base: {
        email: Email
        domains: DomainOrWildcard[]
        cert_path?: string
        key_path?: string
      } =
        cfg && cfg.provider !== 'local'
          ? {
              email: (cfg as Exclude<Autocert.AutocertConfig, Autocert.LocalOptions>).email,
              domains: (cfg as Exclude<Autocert.AutocertConfig, Autocert.LocalOptions>).domains,
              cert_path: cfg.cert_path,
              key_path: cfg.key_path,
            }
          : {
              email: '',
              domains: [],
            }

      let nextCfg: Autocert.AutocertConfig
      switch (next) {
        case 'cloudflare':
          nextCfg = {
            provider: 'cloudflare',
            options: { auth_token: '' },
            ...base,
          } as Autocert.CloudflareOptions
          break
        case 'clouddns':
          nextCfg = {
            provider: 'clouddns',
            options: {
              client_id: '',
              email: '' as Email,
              password: '',
            },
            ...base,
          } as Autocert.CloudDNSOptions
          break
        case 'duckdns':
          nextCfg = {
            provider: 'duckdns',
            options: { token: '' },
            ...base,
          } as Autocert.DuckDNSOptions
          break
        case 'ovh':
          nextCfg = {
            provider: 'ovh',
            options: {
              application_secret: '',
              consumer_key: '',
              application_key: '',
              api_endpoint: undefined,
            },
            ...base,
          } as Autocert.OVHOptionsWithAppKey
          break
        case 'porkbun':
          nextCfg = {
            provider: 'porkbun',
            options: { api_key: '', secret_api_key: '' },
            ...base,
          } as Autocert.PorkbunOptions
          break
        case 'custom':
          nextCfg = {
            provider: 'custom',
            ...base,
          } as Autocert.CustomOptions
          break
        default:
          nextCfg = { provider: next, options: {}, ...base } as Autocert.AutocertConfig
      }
      setCfg(nextCfg)
    },
    [cfg, setCfg]
  )

  const updateCommon = useCallback(
    (changes: Partial<Autocert.AutocertConfigBase> & { cert_path?: string; key_path?: string }) => {
      if (!cfg || cfg.provider === 'local') return
      const curr = cfg as Exclude<Autocert.AutocertConfig, Autocert.LocalOptions>
      setCfg({ ...curr, ...changes } as Autocert.AutocertConfig)
    },
    [cfg, setCfg]
  )
  const autocertCfg = cfg as Exclude<Autocert.AutocertConfig, Autocert.LocalOptions>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Current certificate</CardTitle>
            <Suspense>
              <AutocertRenewDialogButton />
            </Suspense>
          </CardHeader>
          <CardContent>
            <AutocertInfo />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Common options</CardTitle>
          </CardHeader>
          <CardContent flex>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium">Certificate provider</label>
              <Select
                value={provider}
                onValueChange={v => setProvider(v as Autocert.AutocertProvider)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {Autocert.AUTOCERT_PROVIDERS.map(p => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence initial={false} mode="popLayout">
              {provider && provider !== 'local' && (
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <TransitionDiv key="autocert-domains">
                    <LabeledInput
                      label="Email"
                      type="email"
                      value={autocertCfg.email ?? ''}
                      onChange={v => updateCommon({ email: v })}
                      required
                    />
                    <div className="flex gap-2">
                      <Label>Domains</Label>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Add domain"
                        onClick={() =>
                          updateCommon({
                            domains: [...autocertCfg.domains, ''],
                          })
                        }
                      >
                        <IconPlus />
                      </Button>
                    </div>
                    <ListInput
                      placeholder="*.example.com"
                      value={autocertCfg.domains ?? []}
                      onChange={v => updateCommon({ domains: v })}
                      card={false}
                    />
                    <div className="flex gap-2">
                      <Label>DNS resolvers</Label>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Add DNS resolver"
                        onClick={() =>
                          updateCommon({
                            resolvers: [...(autocertCfg.resolvers ?? []), ''],
                          })
                        }
                      >
                        <IconPlus />
                      </Button>
                    </div>
                    <ListInput
                      placeholder="1.1.1.1:53"
                      value={autocertCfg.resolvers ?? []}
                      onChange={v => updateCommon({ resolvers: v })}
                      card={false}
                    />
                  </TransitionDiv>
                </div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <AnimatePresence initial={false} mode="popLayout">
          {provider !== 'local' && cfg && (
            <TransitionDiv className="border rounded-md p-3" key="provider-options">
              <div className="text-sm font-semibold mb-3">Provider options</div>
              <DnsProviderOptionsEditor cfg={cfg} onChange={setCfg} />
            </TransitionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function DnsProviderOptionsEditor({
  cfg,
  onChange,
}: {
  cfg: Autocert.AutocertConfig
  onChange: (v: Autocert.AutocertConfig) => void
}) {
  const provider = cfg.provider

  const setOptions = useCallback(
    (opts: unknown) => {
      // Only providers with options reach here
      if (provider === 'local') return
      onChange({ ...cfg, options: opts } as Autocert.AutocertConfig)
    },
    [cfg, onChange, provider]
  )

  if (provider === 'cloudflare') {
    const opts = (cfg as Autocert.CloudflareOptions).options
    return (
      <LabeledInput
        label="Auth Token"
        value={opts.auth_token}
        onChange={v => setOptions({ ...opts, auth_token: v })}
      />
    )
  }

  if (provider === 'clouddns') {
    const opts = (cfg as Autocert.CloudDNSOptions).options
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledInput
          label="Client ID"
          value={opts.client_id}
          onChange={v => setOptions({ ...opts, client_id: v })}
        />
        <LabeledInput
          label="Email"
          value={opts.email}
          onChange={v => setOptions({ ...opts, email: v })}
        />
        <div className="sm:col-span-2">
          <LabeledInput
            label="Password"
            value={opts.password}
            onChange={v => setOptions({ ...opts, password: v })}
          />
        </div>
      </div>
    )
  }

  if (provider === 'duckdns') {
    const opts = (cfg as Autocert.DuckDNSOptions).options
    return (
      <LabeledInput
        label="Token"
        value={opts.token}
        onChange={v => setOptions({ ...opts, token: v })}
      />
    )
  }

  if (provider === 'porkbun') {
    const opts = (cfg as Autocert.PorkbunOptions).options
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledInput
          label="API Key"
          value={opts.api_key}
          onChange={v => setOptions({ ...opts, api_key: v })}
        />
        <LabeledInput
          label="Secret API Key"
          value={opts.secret_api_key}
          onChange={v => setOptions({ ...opts, secret_api_key: v })}
        />
      </div>
    )
  }

  if (provider === 'custom') {
    return (
      <MapInput
        label="custom"
        card={false}
        schema={AutocertSchema.definitions.CustomOptions}
        value={{ ...cfg }}
        onChange={onChange}
      />
    )
  }

  if (provider === 'ovh') {
    const opts = cfg.options as
      | Autocert.OVHOptionsWithAppKey['options']
      | Autocert.OVHOptionsWithOAuth2Config['options']

    // derive auth mode
    const authMode = 'application_key' in opts ? 'application_key' : 'oauth2'

    const applicationKey = 'application_key' in opts ? opts.application_key : undefined
    const oauth2Config = 'oauth2_config' in opts ? opts.oauth2_config : undefined

    const setAuthMode = (mode: 'application_key' | 'oauth2') => {
      if (mode === 'application_key') {
        const next = {
          application_secret: opts.application_secret || '',
          consumer_key: opts.consumer_key || '',
          application_key: applicationKey || '',
          api_endpoint: opts.api_endpoint,
        }
        setOptions(next)
      } else {
        const next = {
          application_secret: opts.application_secret || '',
          consumer_key: opts.consumer_key || '',
          api_endpoint: opts.api_endpoint,
          oauth2_config: {
            client_id: oauth2Config?.client_id || '',
            client_secret: oauth2Config?.client_secret || '',
          },
        }
        setOptions(next)
      }
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LabeledInput
            label="Application secret"
            value={opts.application_secret || ''}
            onChange={v => setOptions({ ...opts, application_secret: v })}
          />
          <LabeledInput
            label="Consumer key"
            value={opts.consumer_key || ''}
            onChange={v => setOptions({ ...opts, consumer_key: v })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">API endpoint</label>
          <Select
            value={opts.api_endpoint ?? ''}
            onValueChange={v => setOptions({ ...opts, api_endpoint: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select endpoint" />
            </SelectTrigger>
            <SelectContent>
              {Autocert.OVH_ENDPOINTS.map(e => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Auth method</label>
          <Select
            value={authMode}
            onValueChange={v => setAuthMode(v as 'application_key' | 'oauth2')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="application_key">Application Key</SelectItem>
              <SelectItem value="oauth2">OAuth2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {authMode === 'application_key' ? (
          <LabeledInput
            label="Application key"
            value={applicationKey ?? ''}
            onChange={v => setOptions({ ...opts, application_key: v, oauth2_config: undefined })}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LabeledInput
              label="Client ID"
              value={oauth2Config?.client_id ?? ''}
              onChange={v =>
                setOptions({
                  ...opts,
                  application_key: undefined,
                  oauth2_config: { ...(oauth2Config ?? {}), client_id: v },
                })
              }
            />
            <LabeledInput
              label="Client Secret"
              value={oauth2Config?.client_secret ?? ''}
              onChange={v =>
                setOptions({
                  ...opts,
                  application_key: undefined,
                  oauth2_config: { ...(oauth2Config ?? {}), client_secret: v },
                })
              }
            />
          </div>
        )}
      </div>
    )
  }

  // Unknown/other providers with options object
  if ('options' in cfg && typeof cfg.options === 'object' && cfg.options) {
    const entries = Object.entries(cfg.options)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {entries.map(([k, v]) => (
          <LabeledInput
            key={k}
            label={k}
            value={`${v ?? ''}`}
            onChange={val => setOptions({ ...cfg.options, [k]: val })}
          />
        ))}
      </div>
    )
  }

  return null
}

function LabeledInput({
  label,
  value,
  onChange,
  ...props
}: {
  label: string
  value: string
  onChange: (v: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  return (
    <TransitionDiv key={label}>
      <Label>{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} {...props} />
    </TransitionDiv>
  )
}

function TransitionDiv({
  children,
  className,
  ...props
}: {
  children: React.ReactNode
  className?: string
} & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}
