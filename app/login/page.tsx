'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api, formatError } from '@/lib/api-client'
import { siteConfig } from '@/site-config'
import { Eye, EyeClosed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  const form = useForm<{ username: string; password: string }>({
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const submit = useCallback(
    async (value: { username: string; password: string }) => {
      form.clearErrors()
      await api.auth
        .callback({
          username: value.username,
          password: value.password,
        })
        .then(() => router.replace('/'))
        .catch(error => {
          form.setError('password', { type: 'server', message: formatError(error).message })
        })
    },
    [router, form]
  )

  const toggleVisibility = useCallback(() => {
    setIsVisible(!isVisible)
  }, [isVisible])

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      void form.handleSubmit(submit)(e)
    },
    [form, submit]
  )

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{siteConfig.metadata.title}</CardTitle>
          <CardDescription>{siteConfig.metadata.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-6 items-stretch relative">
                <FormField
                  control={form.control}
                  name="username"
                  rules={{ required: 'Username is required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  rules={{ required: 'Password is required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={isVisible ? 'text' : 'password'}
                            className="pr-10"
                            {...field}
                          />
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

// removed custom ErrorMessage in favor of shared FormMessage
