import { PageTransition } from "@/shared/components/layout/page-transition";

export default function DevTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
