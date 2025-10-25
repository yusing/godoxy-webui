import AllSystemInfoProvider from '@/components/servers/AllSystemInfoProvider'
import ServerContent from '@/components/servers/content/Content'
import ServersSidebar from '@/components/servers/Sidebar'
import { Suspense } from 'react'

export default function ServersPage() {
  return (
    <div className="flex h-full">
      <ServersSidebar />
      <ServerContent />
      <Suspense>
        <AllSystemInfoProvider />
      </Suspense>
    </div>
  )
}
