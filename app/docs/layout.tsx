export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex w-full flex-col gap-4r">{children}</div>;
}
// TODO