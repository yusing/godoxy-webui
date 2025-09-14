import { LogOut } from 'lucide-react'

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <a href="/api/v1/auth/logout" className={className}>
      <LogOut className="size-4" />
    </a>
  )
}
