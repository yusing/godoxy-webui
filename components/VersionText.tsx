import { api } from '@/lib/api-client'

export default async function VersionText() {
  const version = await api.version
    .version()
    .then(res => res.data)
    .catch(() => 'Error')
  return <p className="text-sm text-muted-foreground">{version}</p>
}
