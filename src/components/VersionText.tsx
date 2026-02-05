import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'

export default function VersionText({ className }: { className?: string }) {
  const [version, setVersion] = useState<string | null>(null)
  useEffect(() => {
    api.version
      .version()
      .then(res => res.data)
      .then(setVersion)
      .catch(toastError)
  }, [])
  return <span className={cn('text-sm text-muted-foreground', className)}>{version}</span>
}
