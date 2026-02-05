import { createFileRoute } from '@tanstack/react-router'
import MockRequestForm from '@/components/playground/MockRequestForm'
import MockResponseForm from '@/components/playground/MockResponseForm'
import PresetExamples from '@/components/playground/PresetExamples'
import ResultsDisplay from '@/components/playground/ResultsDisplay'
import RulesEditor from '@/components/playground/RulesEditor'
import RunButton from '@/components/playground/RunButton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const wide = 'xl'

export const Route = createFileRoute('/playground')({
  component: PlaygroundPage,
})

function PlaygroundPage() {
  return (
    <div className={`w-full h-full px-4 grid grid-cols-1 ${wide}:grid-cols-2 gap-4 py-4`}>
      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Rules Playground</h1>
          <div className="flex items-center gap-2">
            <PresetExamples />
            <RunButton />
          </div>
        </div>

        <Tabs defaultValue="rules" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="request">Mock Request</TabsTrigger>
            <TabsTrigger value="response">Mock Response</TabsTrigger>
          </TabsList>
          <TabsContent value="rules" className="flex-1 mt-2 overflow-hidden">
            <RulesEditor />
          </TabsContent>
          <TabsContent value="request" className="flex-1 mt-2 overflow-y-auto">
            <MockRequestForm />
          </TabsContent>
          <TabsContent value="response" className="flex-1 mt-2 overflow-y-auto">
            <MockResponseForm />
          </TabsContent>
        </Tabs>
      </div>
      <div className={`overflow-hidden border-t ${wide}:border-t-0 pt-4 ${wide}:pt-0`}>
        <ResultsDisplay />
      </div>
    </div>
  )
}
