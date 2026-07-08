import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'

export default function LogoutButton({ className }: { className?: string }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    try {
      await api.auth.logout()
      window.location.assign('/')
    } catch (error) {
      setIsLoggingOut(false)
      toastError(error)
    }
  }

  return (
    <button
      type="button"
      className={className}
      disabled={isLoggingOut}
      title="Logout"
      aria-label="Logout"
      onClick={handleLogout}
    >
      <LogOut className="size-4" />
    </button>
  )
}
