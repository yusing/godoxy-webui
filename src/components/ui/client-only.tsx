export default function ClientOnly({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') {
    return null
  }
  return children
}
