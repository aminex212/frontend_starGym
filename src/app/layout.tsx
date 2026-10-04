import type { Metadata } from "next";

import "./globals.css";

import AuthGuard from "@/components/auth/AuthGuard";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "StarGym Dashboard",
  description: "StarGym Fighting Academy Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <AuthGuard>{children}</AuthGuard>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}