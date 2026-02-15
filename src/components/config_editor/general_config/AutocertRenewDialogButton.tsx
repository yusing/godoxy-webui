import { IconRefresh } from '@tabler/icons-react'
import Convert from 'ansi-to-html'
import { useCallback, useState } from 'react'
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
      <DialogTrigger render={<Button size="sm" variant="outline" type="button" />}>
        <IconRefresh className="size-4" />
        Renew
      </DialogTrigger>
      <DialogContent className="min-w-[70vw]">
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
                  className="whitespace-pre-wrap text-xs font-mono font-medium"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: ANSI escape codes are safe
                  dangerouslySetInnerHTML={{ __html: convert.toHtml(line) }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button type="button" variant="outline" disabled={!finished} />}>
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
