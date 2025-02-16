import { SystemInfoGraphsPage } from "@/components/metrics/system_info_graphs_page";
import { ClientOnly } from "@chakra-ui/react";

export default async function MetricsPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string[] }>;
}>) {
  const slug = (await params).slug.map(decodeURIComponent);
  return (
    <ClientOnly>
      <SystemInfoGraphsPage agent={{ name: slug[0]!, addr: slug[1] }} />
    </ClientOnly>
  );
}
