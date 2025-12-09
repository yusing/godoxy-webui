'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { StoreFormInputField, StoreFormPasswordField } from '@/components/ui/store/Input'

import { api, formatError } from '@/lib/api-client'
import { siteConfig } from '@/site-config'
import { useForm, type CreateFormOptions } from 'juststore'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

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

export default function LoginPage() {
  const router = useRouter()

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
        .then(() => router.replace('/'))
        .catch(error => form.password.setError(formatError(error).message))
    },
    [router, form]
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
