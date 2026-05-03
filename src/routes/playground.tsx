import { createFileRoute } from '@tanstack/react-router'
import MockRequestForm from '@/components/playground/MockRequestForm'
import MockResponseForm from '@/components/playground/MockResponseForm'
import PresetExamples from '@/components/playground/PresetExamples'
import QuickReferenceCard from '@/components/playground/QuickReferenceCard'
import ResultsDisplay from '@/components/playground/ResultsDisplay'
import RulesEditor from '@/components/playground/RulesEditor'
import RunButton from '@/components/playground/RunButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/playground')({
  component: PlaygroundPage,
})

function PlaygroundPage() {
  return (
    <div
      className={cn(
        'w-full px-4 grid grid-cols-1 gap-4 py-4',
        'xl:grid-cols-2 xl:h-full xl:min-h-0 xl:overflow-hidden',
        'max-xl:h-auto max-xl:min-h-0'
      )}
    >
      <div
        className={cn(
          'flex min-h-0 flex-col gap-4',
          'xl:overflow-hidden',
          'max-xl:overflow-visible'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Rules Playground</h1>
          <div className="flex items-center gap-2">
            <PresetExamples />
            <RunButton />
          </div>
        </div>

        <Tabs defaultValue="rules" className="flex min-h-0 flex-1 flex-col gap-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="request">Mock Request</TabsTrigger>
            <TabsTrigger value="response">Mock Response</TabsTrigger>
          </TabsList>
          <TabsContent
            value="rules"
            className="mt-2 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <RulesEditor />
            </div>
          </TabsContent>
          <TabsContent
            value="request"
            className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <MockRequestForm />
          </TabsContent>
          <TabsContent
            value="response"
            className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <MockResponseForm />
          </TabsContent>
        </Tabs>
      </div>
      <div
        className={cn(
          'flex flex-col gap-4',
          'xl:min-h-0 xl:flex-1 xl:overflow-hidden',
          'max-xl:flex-none max-xl:overflow-visible'
        )}
      >
        <div className={cn('flex min-h-96 flex-col overflow-hidden', 'xl:flex-[3]')}>
          <ResultsDisplay />
        </div>
        <div
          className={cn(
            'hidden flex-col overflow-hidden md:flex',
            'min-h-[min(28rem,55vh)] xl:min-h-0 xl:flex-[2]'
          )}
        >
          <QuickReferenceCard />
        </div>
      </div>
    </div>
  )
}
