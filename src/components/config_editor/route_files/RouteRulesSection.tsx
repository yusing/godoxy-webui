import type { State } from 'juststore'
import { stringify as stringifyYAML } from 'yaml'
import { CodeMirror } from '@/components/ObjectDataList'
import { blockRules } from '@/lib/codemirror/rules-block'
import type { Routes } from '@/types/godoxy'

export function RouteRulesSection({
  rules,
}: {
  rules: State<string | Routes.RouteRule[] | undefined>
}) {
  const [value, setValue] = rules.useState()
  return (
    <CodeMirror
      extensions={[blockRules()]}
      basicSetup
      readOnly={false}
      value={typeof value !== 'string' ? stringifyYAML(value) : value}
      className="min-h-[300px] max-h-[50vh]"
      setValue={setValue}
      language="block"
    />
  )
}
