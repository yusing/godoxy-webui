'use client'
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react'
import { GoDoxyErrorText } from '../GoDoxyError'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { configStore } from './store'

export default function ConfigValidationError() {
  const error = configStore.validateError.use()
  if (!error)
    return (
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>Valid</AlertTitle>
        <AlertDescription>The configuration is valid.</AlertDescription>
      </Alert>
    )
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="-ml-12 max-h-[150px] overflow-y-auto overflow-x-hidden">
        {error && <GoDoxyErrorText err={error} />}
      </AlertDescription>
    </Alert>
  )
}
