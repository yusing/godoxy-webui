import WikiPage from "@/components/wiki_page";

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const slug = (await params).slug;
  return <WikiPage file={slug} />;
}
