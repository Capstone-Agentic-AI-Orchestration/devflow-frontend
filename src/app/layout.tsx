import type { Metadata } from "next";
import "@/shared/styles/globals.css";
import { AuthProvider } from "@/shared/auth/auth-provider";
import { ToastProvider } from "@/shared/components/ui/toast-provider";

export const metadata: Metadata = {
  title: "DevFlow - One prompt, build everything",
  description:
    "DevFlow turns a single brief into production-grade software with a LangGraph-powered multi-agent build system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
