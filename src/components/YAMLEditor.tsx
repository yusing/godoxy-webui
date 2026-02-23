import { yaml } from '@codemirror/lang-yaml'
import { type ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { yamlSchemaExtensions } from '@/lib/codemirror'
import type { JSONSchema } from '@/types/schema'
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
