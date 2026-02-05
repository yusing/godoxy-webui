import { StoreListInput } from '@/components/form/StoreListInput'
import { configStore } from '../store'

export default function DomainMatchingConfigContent() {
  return (
    <StoreListInput
      label="Match Domains"
      description="List of domains to match"
      placeholder="example.com"
      state={configStore.configObject.match_domains.ensureArray()}
    />
  )
}
