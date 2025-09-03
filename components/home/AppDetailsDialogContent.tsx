import { Badge } from '@/components/ui/badge'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import ObjectDataList from '../ObjectDataList'

export default function AppDetailsDialogContent({ alias }: { alias: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: route } = useQuery({
    queryKey: ['route', alias],
    queryFn: () => api.route.route(alias).then(r => r.data),
  })

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const filteredRoute = useMemo(() => {
    if (!searchTerm) return route

    const filterObject = (obj: unknown): unknown | null => {
      if (typeof obj === 'string') {
        return obj.toLowerCase().includes(searchTerm.toLowerCase()) ? obj : null
      }
      if (typeof obj === 'object' && obj !== null) {
        const filtered: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
            filtered[key] = value
          } else {
            const filteredValue = filterObject(value)
            if (filteredValue !== null) {
              filtered[key] = filteredValue
            }
          }
        }
        return Object.keys(filtered).length > 0 ? filtered : null
      }
      return obj?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ? obj : null
    }

    return filterObject(route) || {}
  }, [route, searchTerm])

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">Route Details</DialogTitle>
        <DialogDescription className="gap-2 relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
          <Input
            className="w-full pl-8"
            placeholder="Search in route data..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
          />
          {searchTerm && (
            <Badge variant={'outline'} className="absolute right-2 top-1/2 -translate-y-1/2">
              Filtered
            </Badge>
          )}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="h-full max-h-[calc(100vh-20rem)]">
        <ObjectDataList v={filteredRoute} />
      </ScrollArea>
    </>
  )
}
