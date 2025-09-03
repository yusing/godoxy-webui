import QueryProvider from '@/components/QueryProvider'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <QueryProvider>{children}</QueryProvider>
    </SidebarProvider>
  )
}
