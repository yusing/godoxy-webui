import { createFileRoute } from '@tanstack/react-router'
import MockRequestForm from '@/components/playground/MockRequestForm'
import MockResponseForm from '@/components/playground/MockResponseForm'
import PresetExamples from '@/components/playground/PresetExamples'
import ResultsDisplay from '@/components/playground/ResultsDisplay'
import RulesEditor from '@/components/playground/RulesEditor'
import RunButton from '@/components/playground/RunButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/playground')({
  component: PlaygroundPage,
})

function PlaygroundPage() {
  return (
    <div
      className={`w-full h-full px-4 grid grid-cols-1 xl:grid-cols-2 gap-4 py-4 [&>*:last-child]:border-t [&>*:last-child]:pt-4 xl:[&>*:last-child]:border-t-0 xl:[&>*:last-child]:pt-0`}
    >
      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Rules Playground</h1>
          <div className="flex items-center gap-2">
            <PresetExamples />
            <RunButton />
          </div>
        </div>

        <Tabs defaultValue="rules" className="flex-col flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="request">Mock Request</TabsTrigger>
            <TabsTrigger value="response">Mock Response</TabsTrigger>
          </TabsList>
          <TabsContent value="rules">
            <RulesEditor />
          </TabsContent>
          <TabsContent value="request">
            <MockRequestForm />
          </TabsContent>
          <TabsContent value="response">
            <MockResponseForm />
          </TabsContent>
        </Tabs>
      </div>
      <div className="overflow-hidden">
        <ResultsDisplay />
      </div>
    </div>
  )
}
