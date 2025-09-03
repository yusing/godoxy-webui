import { LogOut } from 'lucide-react'

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <a href="/logout" className={className}>
      <LogOut className="size-4" />
    </a>
  )
}
