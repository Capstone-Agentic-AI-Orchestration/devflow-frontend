import { PageTransition } from "@/shared/components/layout/page-transition";

export default function ClientAuthTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
