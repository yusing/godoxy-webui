import QueryProvider from '@/components/QueryProvider'
import AllSystemInfoProvider from '@/components/servers/AllSystemInfoProvider'
import ServerContent from '@/components/servers/content/Content'
import ServersSidebar from '@/components/servers/Sidebar'

export default function ServersPage() {
  return (
    <div className="flex h-full">
      <ServersSidebar />
      <ServerContent />
      <QueryProvider>
        <AllSystemInfoProvider />
      </QueryProvider>
    </div>
  )
}
