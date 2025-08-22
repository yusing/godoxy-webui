import AppGrid from '@/components/home/AppsGrid'
import SystemStats from '@/components/home/SystemStats'
import QueryProvider from '@/components/query-provider'

export default function HomePage() {
  return (
    <QueryProvider>
      <SystemStats />
      <AppGrid />
    </QueryProvider>
  )
}
