'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupField } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { StoreSwitchField } from '@/juststore-shadcn/src/components/store/Switch'
import { Moon, Settings, Sun } from 'lucide-react'
import { store } from './store'

export default function SettingsPopover() {
  const sortMethod = store.settings.sortMethod.use()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-fit">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">App Settings</h4>
            <p className="text-xs text-muted-foreground">
              Configure how apps are displayed and organized.
            </p>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs font-medium">Sort Method</Label>
            <RadioGroup
              value={sortMethod}
              onValueChange={value => store.settings.sortMethod.set(value as typeof sortMethod)}
            >
              <RadioGroupField
                id="alphabetical"
                value="alphabetical"
                label="Alphabetical"
                className="text-xs"
              />
              <RadioGroupField
                id="clicks"
                value="clicks"
                label="Most Clicked"
                className="text-xs"
              />
              <RadioGroupField
                id="custom"
                value="custom"
                label="Custom Order"
                className="text-xs"
              />
            </RadioGroup>
          </div>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs font-medium">UI Preferences</Label>
            <StoreSwitchField
              state={store.ui.iconThemeAware}
              title="Theme-Aware Icons"
              labelPlacement="right"
              description={
                <div className="space-y-1">
                  <p>Prefer monochrome light or dark icons based on the current theme.</p>
                  <div className="flex items-center gap-1">
                    <span className="bg-white text-black p-0.5 border rounded-md">Light icons</span>
                    on <Moon className="size-3 inline-block" /> night mode,
                    <span className="bg-black text-white p-0.5 border rounded-md">dark icons</span>
                    on <Sun className="size-3 inline-block" /> light mode.
                  </div>
                </div>
              }
            />
            <StoreSwitchField
              state={store.ui.segmentedByCategories}
              title="Segment by Categories"
              labelPlacement="right"
              description="Group items into category sections in All/Favorites."
            />
          </div>
          <store.ui.showKeyboardHints.Render>
            {showKeyboardHints =>
              !showKeyboardHints && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">Keyboard Hints</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => store.ui.showKeyboardHints.set(true)}
                    >
                      Unhide Keyboard Hints
                    </Button>
                  </div>
                </>
              )
            }
          </store.ui.showKeyboardHints.Render>
        </div>
      </PopoverContent>
    </Popover>
  )
}
