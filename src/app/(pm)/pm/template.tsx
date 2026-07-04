import { PageTransition } from "@/shared/components/layout/page-transition";

export default function PMTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
