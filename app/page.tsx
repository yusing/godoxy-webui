import AppEditDialog from '@/components/home/AppEditDialog'
import AppGrid from '@/components/home/AppsGrid'
import SystemStats from '@/components/home/SystemStats'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-2 sm:py-8 sm:space-y-6 flex-1">
      <SystemStats />
      <AppGrid />
      <AppEditDialog />
    </div>
  )
}
