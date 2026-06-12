import type { Metadata, Viewport } from "next";
import "./globals.css";

/** Auth + Supabase data are request-time only; skip static prerender at build. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SplitBite",
  description: "Flexible expense splitting for groups",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
