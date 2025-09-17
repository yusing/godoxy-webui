import { SidebarProvider } from '@/components/ui/sidebar'

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>
}
