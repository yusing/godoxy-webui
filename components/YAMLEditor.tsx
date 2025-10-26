import type { JSONSchema } from '@/types/schema'
import { yaml } from '@codemirror/lang-yaml'
import { linter } from '@codemirror/lint'
import { hoverTooltip, type ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { stateExtensions } from 'codemirror-json-schema'
import { yamlSchemaHover, yamlSchemaLinter } from 'codemirror-json-schema/yaml'
import { CodeMirror } from './ObjectDataList'

export type YAMLEditorProps = {
  schema?: JSONSchema
  onChange: (value: string) => void
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

function yamlSchemaExtensions(schema: unknown) {
  return [
    linter(yamlSchemaLinter(), {
      delay: 200,
    }),
    hoverTooltip(yamlSchemaHover()),
    stateExtensions(schema as Parameters<typeof stateExtensions>[0]),
  ]
}
