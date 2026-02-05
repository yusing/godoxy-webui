import { middlewareComposeConfigStore } from '../store'
import { MiddlewareComposeEditor } from './MiddlewareEditor'

export default function MiddlewareComposeForm() {
  const compose = middlewareComposeConfigStore.configObject.use() ?? {}
  return (
    <MiddlewareComposeEditor
      data={compose}
      onChange={v => middlewareComposeConfigStore.configObject.set(v)}
    />
  )
}
