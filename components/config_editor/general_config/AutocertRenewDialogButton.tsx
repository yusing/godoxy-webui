import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useWebSocketApi } from '@/hooks/websocket'
import Convert from 'ansi-to-html'
import { RefreshCcwIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

const convert = new Convert()

export default function AutocertRenewDialogButton() {
  const [open, setOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [log, setLog] = useState<string[]>([])

  // Establish WS only when dialog is open
  useWebSocketApi<string>({
    endpoint: '/cert/renew',
    json: false,
    shouldConnect: open,
    onMessage: msg => setLog(prev => [...prev, msg]),
    onClose: () => setFinished(true),
  })

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (next) {
      setFinished(false)
      setLog([])
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" type="button">
          <RefreshCcwIcon className="w-4 h-4" />
          Renew
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Renew Log</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto text-sm">
          {log.length === 0 ? (
            <div className="text-muted-foreground">Waiting for logs...</div>
          ) : (
            <div className="flex flex-col gap-1 leading-relaxed">
              {log.map((line, i) => (
                <pre
                  key={i}
                  className="whitespace-pre-wrap text-xs"
                  dangerouslySetInnerHTML={{ __html: convert.toHtml(line) }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={!finished}>
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
