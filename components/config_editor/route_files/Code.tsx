export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted relative rounded-md px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
      {children}
    </code>
  )
}
