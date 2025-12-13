import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Routes } from '@/types/godoxy'
import { ArrowRight, Copy, Edit2, Globe, Trash } from 'lucide-react'
import RouteIcon from './RouteIcon'
import * as utils from './utils'

export default function RouteDisplay({
  alias,
  route,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  alias: string
  route: Routes.Route
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const listeningAddress = utils.getListeningAddress(route)
  const proxyAddress = utils.getProxyAddressOrRoot(route)

  return (
    <div className="space-y-4">
      {/* Header with icon, title and edit button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'shrink-0 rounded-lg p-2 border',
              route.scheme === 'fileserver'
                ? 'bg-green-500/30 border-green-500/20'
                : route.scheme === 'tcp' || route.scheme === 'udp'
                  ? 'bg-indigo-500/30 border-indigo-500/20'
                  : route.scheme === 'http'
                    ? 'bg-blue-500/30 border-blue-500/20'
                    : 'bg-gray-500/30 border-gray-500/20'
            )}
          >
            <RouteIcon
              scheme={route.scheme ?? 'http'}
              className={cn(
                `h-5 w-5`,
                route.scheme === 'fileserver'
                  ? 'text-green-400'
                  : route.scheme === 'tcp' || route.scheme === 'udp'
                    ? 'text-indigo-400'
                    : route.scheme === 'http'
                      ? 'text-blue-400'
                      : 'text-gray-400'
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {utils.getRouteType(route.scheme) + (alias.startsWith('x-') ? ' Template' : '')}
            </h3>
            <p className="text-muted-foreground text-sm">{alias}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button title="Edit" variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button title="Duplicate" variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button title="Delete" size="sm" variant="destructive" onClick={onDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Connection details */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Globe className="h-4 w-4" />

        {listeningAddress && (
          <>
            <span className="font-mono">{listeningAddress}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
        <span className="font-mono">{proxyAddress}</span>
      </div>
    </div>
  )
}
