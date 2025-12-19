'use client'
import { IconCircleCheck } from '@tabler/icons-react'
import { GoDoxyErrorAlert } from '../GoDoxyError'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { configStore } from './store'

export default function ConfigValidationError() {
  const error = configStore.validateError.use()
  if (!error)
    return (
      <Alert variant="success">
        <IconCircleCheck />
        <AlertTitle>Valid</AlertTitle>
        <AlertDescription>The configuration is valid.</AlertDescription>
      </Alert>
    )
  return <GoDoxyErrorAlert title="Error" err={error} />
}
