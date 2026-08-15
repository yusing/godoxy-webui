import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import AllSystemInfoProvider from '@/components/servers/AllSystemInfoProvider'
import WebUISettingsProvider from '@/components/servers/WebUIConfigProvider'
import ServerContent from '@/components/servers/content/Content'
import ServersSidebar from '@/components/servers/Sidebar'
import '@/stats_bar.css'

export const Route = createFileRoute('/servers')({
  component: ServersPage,
})

function ServersPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden xl:flex-row">
      <ServersSidebar />
      <ServerContent />
      <Suspense>
        <WebUISettingsProvider />
        <AllSystemInfoProvider />
      </Suspense>
    </div>
  )
}
