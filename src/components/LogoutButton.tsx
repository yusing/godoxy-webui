import { LogOut } from 'lucide-react'
import { useRef, useState } from 'react'
import { getCSRFToken } from '@/lib/csrf'
import { toastError } from '@/lib/toast'

export default function LogoutButton({ className }: { className?: string }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const csrfInput = useRef<HTMLInputElement>(null)

  return (
    <form
      action="/api/v1/auth/logout"
      method="post"
      onSubmit={async event => {
        event.preventDefault()
        if (isLoggingOut) {
          return
        }

        const form = event.currentTarget
        setIsLoggingOut(true)
        try {
          // Prime the CSRF cookie even if the session has already expired.
          const response = await fetch('/api/v1/auth/check', {
            method: 'HEAD',
            redirect: 'error',
          })
          const token = getCSRFToken()
          const canSubmit = response.ok || response.status === 401
          if (!canSubmit || !token || !csrfInput.current) {
            throw new Error('Unable to prepare logout. Reload and try again.')
          }

          csrfInput.current.value = token
          // Navigate the tab through the provider's logout redirect.
          form.submit()
        } catch (error) {
          setIsLoggingOut(false)
          toastError(error)
        }
      }}
    >
      <input ref={csrfInput} type="hidden" name="csrf_token" />
      <button
        type="submit"
        className={className}
        disabled={isLoggingOut}
        title="Logout"
        aria-label="Logout"
      >
        <LogOut className="size-4" />
      </button>
    </form>
  )
}
