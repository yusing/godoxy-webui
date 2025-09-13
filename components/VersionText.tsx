'use client'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { useEffect, useState } from 'react'

export default function VersionText() {
  const [version, setVersion] = useState<string | null>(null)
  useEffect(() => {
    api.version
      .version()
      .then(res => res.data)
      .then(setVersion)
      .catch(toastError)
  }, [])
  return <p className="text-sm text-muted-foreground">{version}</p>
}
