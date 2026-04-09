import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { ConfigSchema, MiddlewareComposeSchema, RoutesSchema } from '@/types/godoxy'
import type { JSONSchema } from '@/types/schema'
import { CodeMirror } from '../CodeMirror'
import YAMLEditor from '../YAMLEditor'
import { configStore } from './store'

const schemas: Record<string, JSONSchema> = {
  config: ConfigSchema,
  provider: RoutesSchema,
  middleware: MiddlewareComposeSchema,
} as const

export default function ConfigYAMLEditor({ ...props }: Omit<ReactCodeMirrorProps, 'onChange'>) {
  const activeFile = configStore.activeFile.use()
  const content = configStore.content.use()
  const error = configStore.error.use()
  const isLoading = configStore.isLoading.use()

  if (error) {
    return <CodeMirror readOnly value={error} />
  }

  if (isLoading) {
    return <CodeMirror readOnly value="Loading..." />
  }

  return (
    <YAMLEditor
      value={content}
      onChange={_content => configStore.content.set(_content)}
      schema={activeFile ? schemas[activeFile.type] : undefined}
      {...props}
    />
  )
}
