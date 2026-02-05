import YAMLEditor from '@/components/YAMLEditor'
import { store } from './store'

export default function RulesEditor() {
  const [rules, setRules] = store.rules.useState()

  return (
    <div className="flex flex-col h-full space-y-2">
      <span className="font-medium text-sm text-muted-foreground">Rules (YAML)</span>
      <YAMLEditor
        value={rules}
        onChange={rules => setRules(rules)}
        className="border rounded-md w-full h-full"
      />
    </div>
  )
}
