import LoadingRing from '@/components/LoadingRing'
import { CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { DataList, DataListRow } from '@/components/ui/data-list'
import type { CertInfo } from '@/lib/api'
import { api } from '@/lib/api-client'
import { formatTimestamp } from '@/lib/format'
import { useEffect } from 'react'
import { useAsync } from 'react-use'

export default function AutocertInfo({
  navRef,
}: {
  navRef: React.RefObject<HTMLDivElement | null>
}) {
  const {
    value: certInfo,
    error,
    loading,
  } = useAsync(async () => api.cert.info().then(res => res.data))

  useEffect(() => {
    if (!navRef.current) return
    const shouldHide = !certInfo || certInfo.length == 0
    navRef.current.style.display = shouldHide ? 'none' : 'flex'
  }, [certInfo, navRef])

  if (!certInfo)
    return (
      <div className="flex items-center justify-center h-full">
        {loading ? (
          <LoadingRing />
        ) : error ? (
          <span>Error: {error.message}</span>
        ) : (
          <span>No certificate info</span>
        )}
      </div>
    )
  return (
    <CarouselContent className="transition-[height] duration-200 ease-in-out items-start">
      {certInfo.map(cert => (
        <CarouselItem key={cert.subject}>
          <CertInfo certInfo={cert} />
        </CarouselItem>
      ))}
    </CarouselContent>
  )
}

function CertInfo({ certInfo }: { certInfo: CertInfo }) {
  return (
    <DataList
      labels={['Subject', 'Issuer', 'Registration', 'Expiry', 'DNS names', 'Email addresses']}
    >
      <DataListRow label="Subject" value={certInfo.subject} />
      <DataListRow label="Issuer" value={certInfo.issuer} />
      <DataListRow label="Registration" value={formatTimestamp(certInfo.not_before)} />
      <DataListRow label="Expiry" value={formatTimestamp(certInfo.not_after)} />
      {Array.isArray(certInfo.dns_names) &&
        certInfo.dns_names.map((name, i) => (
          <DataListRow key={`${name}-${i}`} label={`DNS name ${i + 1}`} value={name} />
        ))}
      {Array.isArray(certInfo.email_addresses) && certInfo.email_addresses.length > 0 && (
        <DataListRow label="Email addresses" value={certInfo.email_addresses.join(', ')} />
      )}
    </DataList>
  )
}
