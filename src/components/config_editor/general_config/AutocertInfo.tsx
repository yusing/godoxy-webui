import { Suspense, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import LoadingRing from '@/components/LoadingRing'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataList, DataListRow } from '@/components/ui/data-list'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import type { CertInfo } from '@/lib/api'
import { api } from '@/lib/api-client'
import { formatTimestamp } from '@/lib/format'
import { cn } from '@/lib/utils'
import AutocertRenewDialogButton from './AutocertRenewDialogButton'

function certItemValue(i: number) {
  return `cert-${i}`
}

function parseCertItemIndex(value: string) {
  return Number.parseInt(value.slice('cert-'.length), 10)
}

type EmptyState = {
  title: string
  description?: string
}

function EmptyStateView({ title, description }: EmptyState) {
  return (
    <Empty className="min-h-32 border-0 p-0">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
    </Empty>
  )
}

export default function AutocertInfo() {
  const {
    value: certInfo,
    error,
    loading,
  } = useAsync(async () => api.cert.info().then(res => res.data))

  const [openValues, setOpenValues] = useState<string[]>([])

  useEffect(() => {
    if (!Array.isArray(certInfo)) return
    if (certInfo.length === 0) {
      setOpenValues([])
      return
    }
    setOpenValues(prev => {
      const kept = prev.filter(id => {
        const i = parseCertItemIndex(id)
        return !Number.isNaN(i) && i >= 0 && i < certInfo.length
      })
      if (kept.length > 0) return kept
      return [certItemValue(0)]
    })
  }, [certInfo])

  const emptyState: EmptyState | null = !certInfo
    ? error
      ? {
          title: 'Could not load certificates',
          description: `Error: ${error.message}`,
        }
      : {
          title: 'No certificate info',
        }
    : certInfo.length === 0
      ? {
          title: 'No certificates',
        }
      : null

  return (
    <Card className="overflow-visible">
      <CardHeader className="flex items-center justify-between gap-4">
        <CardTitle>Current certificate</CardTitle>
        <Suspense>
          <AutocertRenewDialogButton />
        </Suspense>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Empty className="min-h-32 border-0 p-0">
            <LoadingRing />
          </Empty>
        ) : emptyState ? (
          <EmptyStateView title={emptyState.title} description={emptyState.description} />
        ) : (
          <Accordion
            value={openValues}
            onValueChange={setOpenValues}
            className="rounded-lg border border-border bg-card"
          >
            {certInfo!.map((cert, i) => (
              <AccordionItem key={`${cert.subject}-${i}`} value={certItemValue(i)} className="px-3">
                <CertAccordionTrigger cert={cert} />
                <AccordionContent className="border-t border-border px-0 pt-3 pb-0">
                  <CertInfoItem certInfo={cert} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}

function CertAccordionTrigger({ cert }: { cert: CertInfo }) {
  const primaryDns =
    Array.isArray(cert.dns_names) && cert.dns_names.length > 0 ? cert.dns_names[0] : null

  return (
    <AccordionTrigger
      className={cn(
        'items-center gap-3 py-2.5 hover:no-underline',
        '**:data-[slot=accordion-trigger-icon]:self-center'
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left font-normal">
        <span className="font-medium text-sm text-foreground truncate">{cert.subject}</span>
        <span className="text-xs text-muted-foreground font-normal truncate">
          {primaryDns ? (
            <>
              <span className="text-foreground/80">{primaryDns}</span>
              {cert.dns_names!.length > 1 ? ` +${cert.dns_names!.length - 1}` : null}
              <span className="mx-1.5 text-border">·</span>
            </>
          ) : null}
          Expires {formatTimestamp(cert.not_after)}
        </span>
      </div>
    </AccordionTrigger>
  )
}

function CertInfoItem({ certInfo }: { certInfo: CertInfo }) {
  return (
    <DataList>
      <DataListRow label="Subject" value={certInfo.subject} />
      <DataListRow label="Issuer" value={certInfo.issuer} />
      <DataListRow label="Registration" value={formatTimestamp(certInfo.not_before)} />
      <DataListRow label="Expiry" value={formatTimestamp(certInfo.not_after)} />
      {Array.isArray(certInfo.dns_names) &&
        certInfo.dns_names.map((name, i) => (
          <DataListRow key={name} label={`DNS name ${i + 1}`} value={name} />
        ))}
      {Array.isArray(certInfo.email_addresses) && certInfo.email_addresses.length > 0 && (
        <DataListRow label="Email addresses" value={certInfo.email_addresses.join(', ')} />
      )}
    </DataList>
  )
}
