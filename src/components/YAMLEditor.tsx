import type { JSONSchema } from '@/types/schema'
import { yaml } from '@codemirror/lang-yaml'
import { linter } from '@codemirror/lint'
import { hoverTooltip, type ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { stateExtensions } from 'codemirror-json-schema-refined'
import { yamlSchemaHover, yamlSchemaLinter } from 'codemirror-json-schema-refined/yaml'
import type { JSONSchema7 } from 'json-schema'
import { CodeMirror } from './ObjectDataList'

export type YAMLEditorProps = {
  schema?: JSONSchema
  onChange?: (value: string) => void
} & ReactCodeMirrorProps

export default function YAMLEditor({
  schema,
  value,
  onChange,
  className,
  ...props
}: YAMLEditorProps) {
  return (
    <CodeMirror
      extensions={[yaml(), ...yamlSchemaExtensions(schema)]}
      autoFocus
      basicSetup
      readOnly={!onChange}
      value={value ?? ''}
      setValue={onChange}
      className={className}
      language="yaml"
      {...props}
    />
  )
}

function yamlSchemaExtensions(schema: JSONSchema | undefined) {
  if (!schema) return []
  return [
    linter(yamlSchemaLinter(), {
      delay: 200,
    }),
    hoverTooltip(
      yamlSchemaHover({
        formatHover,
      })
    ),
    stateExtensions(schema as JSONSchema7),
  ]
}

function formatHover(data: { message: string; typeInfo: string }) {
  const container = document.createElement('div')
  container.className =
    'p-2 max-w-xs bg-card border border-border rounded-md shadow-lg flex flex-col gap-2 min-w-fit max-w-[250px]'

  const messageDiv = document.createElement('span')
  messageDiv.className = 'text-sm font-medium w-full text-foreground'
  messageDiv.textContent = data.message

  const typeInfoDiv = document.createElement('code')
  typeInfoDiv.className = 'text-xs font-mono py-1 rounded w-full text-muted-foreground'
  typeInfoDiv.textContent = data.typeInfo

  container.appendChild(messageDiv)
  container.appendChild(typeInfoDiv)
  return container
}
