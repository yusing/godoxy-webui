import { ConfigSchema, MiddlewareComposeSchema, RoutesSchema } from '@/types/godoxy'
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import YAMLEditor from '../YAMLEditor'
import { configStore } from './store'

const schemas: Record<string, unknown> = {
  config: ConfigSchema,
  provider: RoutesSchema,
  middleware: MiddlewareComposeSchema,
}

export default function ConfigYAMLEditor({ ...props }: Omit<ReactCodeMirrorProps, 'onChange'>) {
  const activeFile = configStore.activeFile.use()
  const content = configStore.content.use()
  const error = configStore.error.use()
  const isLoading = configStore.isLoading.use()

  if (error) {
    return <YAMLEditor readOnly value={error.message} onChange={() => {}} schema={undefined} />
  }

  if (isLoading) {
    return <YAMLEditor readOnly value="Loading..." onChange={() => {}} schema={undefined} />
  }

  return (
    <YAMLEditor
      value={content}
      onChange={content => configStore.content.set(content)}
      schema={activeFile ? schemas[activeFile.type] : undefined}
      {...props}
    />
  )
}
