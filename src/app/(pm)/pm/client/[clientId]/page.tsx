import { PMClientProfileView } from "@/features/pm/clients/views/pm-client-profile-view";

export default async function PMClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return <PMClientProfileView clientId={clientId} />;
}
