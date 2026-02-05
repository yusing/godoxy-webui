import { cn } from '@/lib/utils'

export default function KeyboardReturn({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="currentColor"
      className={cn('inline-block', className)}
      {...props}
    >
      <title>keyboard-return</title>
      <path d="M19,7V11H5.83L9.41,7.41L8,6L2,12L8,18L9.41,16.58L5.83,13H21V7H19Z" />
    </svg>
  )
}
