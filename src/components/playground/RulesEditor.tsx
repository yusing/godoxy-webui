import { yaml } from '@codemirror/lang-yaml'
import { blockRules } from '@/lib/codemirror/rules-block'
import { CodeMirror } from '../ObjectDataList'
import { Button } from '../ui/button'
import { ButtonGroup } from '../ui/button-group'
import { store } from './store'

export default function RulesEditor() {
  const [rules, setRules] = store.rules.useState()
  const [lang, setLang] = store.lang.useState()

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-muted-foreground">
          Rules ({lang === 'yaml' ? 'YAML' : 'Block'})
        </span>
        <ButtonGroup>
          <Button
            size="sm"
            variant={lang === 'yaml' ? 'default' : 'outline'}
            onClick={() => setLang('yaml')}
          >
            YAML
          </Button>
          <Button
            size="sm"
            variant={lang === 'block' ? 'default' : 'outline'}
            onClick={() => setLang('block')}
          >
            Block
          </Button>
        </ButtonGroup>
      </div>
      <CodeMirror
        extensions={[lang === 'yaml' ? yaml() : blockRules()]}
        autoFocus
        basicSetup
        readOnly={!setRules}
        value={rules ?? ''}
        setValue={setRules}
        className="border rounded-md w-full h-full"
        language={lang === 'yaml' ? 'yaml' : 'block'}
      />
    </div>
  )
}
