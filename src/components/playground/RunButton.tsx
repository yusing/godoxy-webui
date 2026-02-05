import { IconPlayerPlay } from '@tabler/icons-react'
import { toast } from 'sonner'
import { parse as parseYAML } from 'yaml'
import type { RouteApiRawRule } from '@/lib/api'
import { Button } from '../ui/button'
import { store } from './store'
import { usePlayground } from './usePlayground'

export default function RunButton() {
  const { execute, isLoading } = usePlayground()

  const runPlayground = () => {
    if (!store.rules.value?.trim()) {
      toast.error('Please enter rules to test')
      return
    }
    execute({
      rules: parseYAML(store.rules.value) as RouteApiRawRule[],
      mockRequest: store.mockRequest.value,
      mockResponse: store.mockResponse.value,
    })
  }

  return (
    <Button onClick={runPlayground} isLoading={isLoading} loadingText="Running...">
      <IconPlayerPlay className="size-4" /> <span>Run</span>
    </Button>
  )
}
