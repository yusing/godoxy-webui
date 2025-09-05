import { ListInput } from '@/components/form/ListInput'
import { configStore } from '../store'

export default function DomainMatchingConfigContent() {
  const [matchDomains, setMatchDomains] = configStore.configObject.match_domains.useState()

  return (
    <ListInput
      label="Match Domains"
      description="List of domains to match"
      placeholder="example.com"
      value={matchDomains ?? []}
      onChange={setMatchDomains}
    />
  )
}
