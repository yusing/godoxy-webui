import AppGrid from '@/components/home/AppsGrid'
import SystemStats from '@/components/home/SystemStats'
import QueryProvider from '@/components/QueryProvider'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6 flex-1">
      <QueryProvider>
        <SystemStats />
        <AppGrid />
      </QueryProvider>
    </div>
  )
}
