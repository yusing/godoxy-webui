export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex w-full flex-col gap-4">{children}</div>;
}
