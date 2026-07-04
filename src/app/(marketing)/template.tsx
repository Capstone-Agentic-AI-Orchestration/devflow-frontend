import { PageTransition } from "@/shared/components/layout/page-transition";

export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
