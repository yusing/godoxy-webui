export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-fit text-center justify-center">
      {children}
    </div>
  );
}
