import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {  useForm } from 'juststore'
import { useCallback } from 'react'
import type {CreateFormOptions} from 'juststore';
import { StoreFormInputField, StoreFormPasswordField } from '@/components/store/Input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'

import { api, formatError } from '@/lib/api-client'
import { siteConfig } from '@/site-config'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

type FormValues = {
  username: string
  password: string
}

const formConfig: CreateFormOptions<FormValues> = {
  username: {
    validate: 'not-empty',
  },
  password: {
    validate: 'not-empty',
  },
}

function LoginPage() {
  const navigate = useNavigate()

  const form = useForm<FormValues>(
    {
      username: '',
      password: '',
    },
    formConfig
  )

  const submit = useCallback(
    async (value: FormValues) => {
      form.clearErrors()
      await api.auth
        .callback(value)
        .then(() => navigate({ to: '/', replace: true }))
        .catch(error => form.password.setError(formatError(error).message))
    },
    [navigate, form]
  )

  return (
    <div className="flex items-center justify-center h-full px-6 sm:px-0">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{siteConfig.metadata.title}</CardTitle>
          <CardDescription>{siteConfig.metadata.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => form.handleSubmit(submit)(e)}>
            <FieldGroup className="gap-4">
              <StoreFormInputField state={form.username} />
              <StoreFormPasswordField state={form.password} />
              <Field>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
