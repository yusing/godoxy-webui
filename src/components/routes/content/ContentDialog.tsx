import { store } from '@/components/routes/store'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import RoutePageContent from './Content'

export default function RouteContentDialog() {
  const isOpen = store.mobileDialogOpen.use()
  const isMobile = useIsMobile()

  return (
    <Dialog open={isOpen && isMobile} onOpenChange={open => store.mobileDialogOpen.set(open)}>
      <DialogContent className="p-0 w-full max-w-[calc(100%-2rem)]">
        <RoutePageContent />
      </DialogContent>
    </Dialog>
  )
}
