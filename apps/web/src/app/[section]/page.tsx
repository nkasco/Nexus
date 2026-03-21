import { notFound } from 'next/navigation';
import { NexusClientApp } from '../../components/nexus-client-app';
import { isDashboardSlug } from '../../lib/dashboard-sections';

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isDashboardSlug(section)) {
    notFound();
  }

  return <NexusClientApp section={section} />;
}
