import { IconRefresh } from '@tabler/icons-react'
import { Button } from '../ui/button'
import { configStore } from './store'

export default function ConfigReloadButton(props: React.ComponentProps<typeof Button>) {
  const [activeFile, setActiveFile] = configStore.activeFile.useState()

  const handleReload = () => {
    setActiveFile(activeFile)
  }

  return (
    <Button {...props} onClick={handleReload}>
      <IconRefresh />
    </Button>
  )
}
