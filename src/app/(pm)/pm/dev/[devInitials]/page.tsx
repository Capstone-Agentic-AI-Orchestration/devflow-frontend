import { PMDevProfileView } from "@/features/pm/team/views/pm-dev-profile-view";

export default async function PMDevPage({ params }: { params: Promise<{ devInitials: string }> }) {
  const { devInitials } = await params;
  return <PMDevProfileView devInitials={devInitials} />;
}
