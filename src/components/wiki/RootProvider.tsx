import { RootProvider as FumadocsRootProvider } from 'fumadocs-ui/provider/tanstack'
import SearchDialog from './SearchDialog'
import '@/docs.css'

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return <FumadocsRootProvider search={{ SearchDialog }}>{children}</FumadocsRootProvider>
}
