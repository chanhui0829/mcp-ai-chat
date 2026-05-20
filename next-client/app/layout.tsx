import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowChat - AI Chat Application",
  description: "AI-powered chat application with real-time streaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
