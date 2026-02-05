import { useTheme } from '@/components/ThemeProvider'
import { IconMoon, IconSun } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { userTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(userTheme === 'light' ? 'dark' : 'light')}
    >
      <IconSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <IconMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
