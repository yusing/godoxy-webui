import MarkdownPage from "@/components/markdown";

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const slug = (await params).slug;
  return <MarkdownPage file={slug} />;
}
