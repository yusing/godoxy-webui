import { IconLogout } from '@tabler/icons-react'

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <a href="/api/v1/auth/logout" className={className}>
      <IconLogout className="size-4" />
    </a>
  )
}
