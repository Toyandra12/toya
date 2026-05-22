import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineNova",
  description: "Game top-ups, SMM marketplace, subscriptions and digital goods.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
