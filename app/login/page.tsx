'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { siteConfig } from '@/site-config'
import { useForm } from '@tanstack/react-form'
import { Eye, EyeClosed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState, type FormEvent } from 'react'
// TODO: SSR
export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      await api.auth
        .callback({
          username: value.username,
          password: value.password,
        })
        .then(() => router.replace('/'))
        .catch(error => setServerError(error.message))
    },
  })
  const router = useRouter()

  const toggleVisibility = useCallback(() => {
    setIsVisible(!isVisible)
  }, [isVisible])

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      form.handleSubmit()
    },
    [form]
  )

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{siteConfig.metadata.title}</CardTitle>
          <CardDescription>{siteConfig.metadata.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6 items-stretch relative">
              <div className="flex flex-col gap-2">
                <Label>Username</Label>
                <form.Field
                  name="username"
                  validators={{
                    onChange: ({ value }) => (!value ? 'Username is required' : undefined),
                    onBlur: ({ value }) => (!value ? 'Username is required' : undefined),
                  }}
                >
                  {field => (
                    <>
                      <Input
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        autoFocus
                      />
                      <ErrorMessage
                        message={
                          field.state.meta.isTouched ? field.state.meta.errors?.[0] : undefined
                        }
                      />
                    </>
                  )}
                </form.Field>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Password</Label>
                <div className="relative">
                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) => (!value ? 'Password is required' : undefined),
                      onBlur: ({ value }) => (!value ? 'Password is required' : undefined),
                    }}
                  >
                    {field => (
                      <Input
                        type={isVisible ? 'text' : 'password'}
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="pr-10"
                      />
                    )}
                  </form.Field>
                  <Button
                    aria-hidden
                    type="button"
                    size="icon"
                    variant={'ghost'}
                    className="opacity-70 hover:opacity-100 absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? <EyeClosed /> : <Eye />}
                  </Button>
                </div>
                <form.Subscribe
                  selector={state => {
                    const meta = state.fieldMeta.password
                    return meta?.isTouched ? meta?.errors?.[0] : undefined
                  }}
                >
                  {touchedError => <ErrorMessage message={serverError ?? touchedError} />}
                </form.Subscribe>
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorMessage({ message }: { message?: string }) {
  if (message) {
    return <p className="text-red-500 text-xs mt-1">{message}</p>
  }
  return null
}
